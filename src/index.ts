import express, { Express, Request, Response, NextFunction } from 'express';
import * as https from 'https';
import * as fs from 'fs';
import * as ejs from 'ejs';
import * as imap from 'imapflow';
import readIni from 'read-ini-file';
import nodemailer from "nodemailer";
import * as bodyParser from "body-parser";
import * as MySQLConnector from './db/mysql.connector';
import { MySQLConnectionSettings } from './db/mysql.connectionsettings';
import * as ApiKeyService from './api/apikey.service';
import { DBApiKeyList } from './api/apikey.model';
import HttpException from './utils/httpexception';
import * as ServicetokenService from './api/servicetoken.service';

import * as VoucherMixerService from './vouchermixer/vouchermixer.service';
import { TDelivery } from './vouchermixer/generated/offer.model';
import { DBOffer } from './vouchermixer/offer.model';



// Config
const path = require('path');
const configpath = path.join(__dirname, '../config.production.ini');
const app: Express = express();

const config = readIni.sync(configpath);

const port = config.service.port;

// Certs
const sslkey = fs.readFileSync(config.service.sslkey);
const sslcert = fs.readFileSync(config.service.sslcert);

let automaticMode = true;

// Poweredby
app.disable('x-powered-by');  

// URLS without API Key
const exApiKeyUrls: RegExp[] = [
  /^\/state/s,
  /^\/test/s,
  /^\/get\/[\w]+/s
];

// ReverseProxy 
app.set('trust proxy', config.service.proxy);

// EJS
app.set( "views", path.join( __dirname, "../templates" ) );
app.set( "view engine", "ejs" );

// MySQL
MySQLConnector.init(MySQLConnectionSettings.createFromIni(config.database));

// SMTP
// Mailer

globalThis.smtp = {mailer: null, from: null};
globalThis.smtp.from = config.smtp.from;
globalThis.smtp.mailer = nodemailer.createTransport({
  host: config.smtp.hostname,
  port: 587,
  secure: false,
  tls : { rejectUnauthorized: false },
  requireTLS: true,
  auth: {
    user: config.smtp.username,
    pass: config.smtp.password,
  },
  logger: true
});
console.log('sending mail from '+global.smtp.from);

// function for mail checks
const imapMailChecker = async () => {
  console.log('Checking for new mails...');

  const imapSession = new imap.ImapFlow({
    host: config.imap.hostname,
    port: config.imap.port,
    secure: false, // means, no ssl, but starttls
    tls: { rejectUnauthorized: false },
    auth: {
        user: config.imap.username,
        pass: config.imap.password
    },
    logger: false,
  });

  await imapSession.connect();

  // Select and lock a mailbox. Throws if mailbox does not exist
  let lock = await imapSession.getMailboxLock('INBOX');
  try {

    let status = await imapSession.status('INBOX', {messages: true});
    console.log('INBOX has ' + status.messages + ' messages');


    if(status.messages ?? 0 > 0){
      
      const messageIdsToParse: number[] = [];
      const messageIdsInvalid: number[] = [];

      console.log('Trace: imap start first loop');
      // collect everything we need
      // splitted in sperate loops - otherwise we get stuck in the library - for whatever reason
      for await (let message of imapSession.fetch('1:*', { envelope: true })) {
        console.log(`${message.uid}: ${message.envelope.subject}`);
 
        if(!message.envelope.subject.endsWith('You received a voucher') && message.envelope.from[0].address?.endsWith('@cccv.de')){
          messageIdsInvalid.push(message.uid);
        } else {
          messageIdsToParse.push(message.uid);
        }
      }
      console.log('Trace: imap end first loop');

      for(let i = 0; i < messageIdsInvalid.length; i++){
        await imapSession.messageMove(messageIdsInvalid[i].toString(), 'INBOX.invalid', { uid: true });
      }
      console.log('Trace: imap end second loop');

      for(let i = 0; i < messageIdsToParse.length; i++){
        console.log(`fetching message ${messageIdsToParse[i]}`);
        const fullMsg = await imapSession.fetchOne(messageIdsToParse[i].toString(), {source: true, uid: true}, {uid: true});
        
        const textcontent = fullMsg.source.toString('utf8');

        // Find Vouchercode with RegEx - we are looking at (CHAOS[\w\d]+)
        const regEx = /CHAOS[\w\d]+/g;
        const vouchercode = textcontent.match(regEx);

        // when found move to processed, else to invalid
        if(vouchercode){
          console.log('Vouchercode found: ' + vouchercode);

          // insert voucher
          try{
            await VoucherMixerService.insertVoucher(undefined, vouchercode[0]);
            // move to processed
            await imapSession.messageMove(fullMsg.uid.toString(), 'INBOX.processed', { uid: true });
          } catch (e) {
            console.log(e);
            // move to error
            await imapSession.messageMove(fullMsg.uid.toString(), 'INBOX.error', { uid: true });
          }
          
        } else {
          console.log('Vouchercode not found');
          // move to invalid
          await imapSession.messageMove(fullMsg.uid.toString(), 'INBOX.invalid', { uid: true });
        }
      }
      console.log('Trace: imap end third loop');
    }
      
  } finally {
      // Make sure lock is released, otherwise next `getMailboxLock()` never returns
      lock.release();
  }

  // log out and close connection
  await imapSession.logout();
}

// Check every 30 minutes of new mails
setInterval(async () => {
  await imapMailChecker();
}, 1000 * 60 * 30);

setTimeout(async () => {
  await imapMailChecker();
}, 2000);

// Bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// DebugLog
app.all("*", async (req: Request, res: Response, next: NextFunction) => {
  console.log("["+req.ip+"|"+req.method+"]", req.originalUrl, req.url, req.params);
  next();
});

// AccessControl
app.use(function (req: Request, res: Response, next: NextFunction) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin,x-api-key, x-usertoken, Content-Type, Accept, Authorization");
  //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (req.method == 'OPTIONS') {
      //console.log(res.header);
      res.json({});
  } else {
      next();
  }
});

// API Key check
ApiKeyService.getAllApiKeys().then((apiKeyList: DBApiKeyList) => {
  globalThis.apikeys = apiKeyList;
  console.log('loaded ' + apiKeyList.length + ' api keys');
});

app.use(function (req, res, next) {
  let withoutApiKeyAllowed = false;
    exApiKeyUrls.forEach((val, idx) => {
      if(val.exec(req.url) !== null){
        withoutApiKeyAllowed = true;
      }
    });

  if (!req.header('X-Api-Key')) {
    // Exceptions
    if(withoutApiKeyAllowed){ 
      next();
    } else {
      var err = new HttpException(403, 'No API-Key');
      next(err);
    }
  } else {
    if(withoutApiKeyAllowed){ 
      next();
    } else {
      if (!globalThis.apikeys.isValid(req.header('X-Api-Key'))){
          var err = new HttpException(403, 'Invalid API-Key');
          next(err); 
      } else {
        next();
      }
    }
  }
});

// Tokencheck
app.use(async function (req: Request, res: Response, next: NextFunction) {
  req.token = {present: false, valid: false, userid: undefined, usecase: []};
  let access_result = false;

  // Todo: Ordentlich umbauen
  if (req.header('X-Servicetoken')) {
      if (req.path.startsWith('/service/')) {
          req.token.present = true;
          const servicetoken = await ServicetokenService.getByTokenvalue(req.header('X-Servicetoken')!);

          if (servicetoken) {
              req.token.usecase = servicetoken.usecase !== undefined ? servicetoken.usecase.split(',') : [];
              access_result = servicetoken.isValid();
          }
      }
  }

  if(req.path.startsWith('/state') || req.path.startsWith('/test') || req.path.startsWith('/get')){
    access_result = true;
  }
 
  if (access_result) {
      next();
  } else {
      var err = new HttpException(403, 'Access denied');
      next(err);
  }
});

app.get('/state', (req: Request, res: Response) => {

  if(req.query.automatic){
    automaticMode = req.query.automatic == 'true';
    console.log('Automatic mode set to: ' + automaticMode);
  }

  const maintenance = {
    enabled: false, 
    until: new Date(new Date().getTime() + 3600 * 1000)
  };

  const token = {
    present: req.token != undefined ? req.token.present : false,
    valid: req.token != undefined ? req.token.valid : false
  }

  const apikey = {
    valid: globalThis.apikeys.isValid(req.header('X-Api-Key'))
  }

  const stateblock = {
    apiversion: 1,
    maintenance: maintenance,
    servertime: new Date(),
    token: token,
    apikey: apikey
  };

  res.json(stateblock);
});

app.get('/test', (req: Request, res: Response) => {
  res.json(req.headers);
});

app.get('/get/:collectionpermit', async (req: Request, res: Response, next: NextFunction) => {

  const offer = await VoucherMixerService.getOfferByCollectionPermit(req.params.collectionpermit);
  if(!offer){
    res.status(404).render('offernotfound', {});
    return;
  }

  if(offer.delivery != TDelivery.OPEN){
    res.status(410).render('offerinvalid', {});
    return;
  }

  res.status(200).render('offervalid', {offer: offer});

});

app.get('/get/:collectionpermit/accept', async (req: Request, res: Response, next: NextFunction) => {
  
    const offer = await VoucherMixerService.getOfferByCollectionPermit(req.params.collectionpermit);
    if(!offer){
      res.status(404).render('offernotfound', {});
      return;
    }
  
    if(offer.delivery != TDelivery.OPEN && offer.delivery != TDelivery.DELIVERED){
      res.status(410).render('offerinvalid', {});
      return;
    }
  
    const voucher = await VoucherMixerService.acceptOffer(offer.id);
    if(!voucher){
      res.status(500).send('Internal Server Error');
      return;
    }

    res.status(200).render('offeraccepted', {offer: offer, voucher: voucher});
  
});

app.get('/get/:collectionpermit/reject', async (req: Request, res: Response, next: NextFunction) => {
  
    const offer = await VoucherMixerService.getOfferByCollectionPermit(req.params.collectionpermit);
    if(!offer){
      res.status(404).render('offernotfound', {});
      return;
    }
  
    if(offer.delivery != TDelivery.OPEN){
      res.status(410).render('offerinvalid', {});
      return;
    }
  
    await VoucherMixerService.rejectOffer(offer.id);
    res.status(200).render('offerrejected', {offer: offer});
  
});

// Frequently check for free vouchers

const checkFreeVouchers = async () => {

  const now = new Date();
  const currentHourGMT2 = (now.getUTCHours() + 2) % 24; // GMT + 2 Stunden

  const pauseHourStart = 0;
  const pauseHourEnd = 7;

  console.log('Current hour (GMT+2): ' + currentHourGMT2);

  if (currentHourGMT2 >= pauseHourStart && currentHourGMT2 < pauseHourEnd) {
    console.log('Pause hour, no automatic checks');
    return;
  }
  

  if(!automaticMode){
    console.log('Automatic mode disabled');
    return;
  }

  console.log('Checking for free vouchers...');

  const nextFreeVoucher = await VoucherMixerService.getSingleFreeVoucher();
  if(!nextFreeVoucher){
    console.log('No free voucher found');
    return;
  }
  
  const candidate = await VoucherMixerService.getNextCandidate();
  if(!candidate){
    console.log('No candidate found');
    return;
  }

  console.log('Found candidate: ' + candidate.mail);
  
  // create offer
  // generate 128 random chars
  const collectionpermit = Array.from({length: 128}, () => Math.floor(Math.random() * 36).toString(36)).join('');
  console.log('Generated collectionpermit: ' + collectionpermit);
  const timeout = new Date(new Date().getTime() + 1000 * 60 * 60 * 6);
  const offer = new DBOffer(0, candidate.id, nextFreeVoucher.id, collectionpermit, new Date(), timeout, TDelivery.OPEN);
  await VoucherMixerService.insertOffer(offer);
  console.log('Created offer for candidate: ' + candidate.mail);

  // send mail
  console.log('Sending mail to: ' + candidate.mail);

  // format timeout date with Europe/Berlin timezone
  const timeoutdtstr = timeout.toLocaleString('de-DE', {timeZone: 'Europe/Berlin'});

  const renderopt = {
    timeoutdtstr: timeoutdtstr,
    candidate: candidate,
    offer: offer,
    voucher: nextFreeVoucher
  };

  const mailcontents = await ejs.renderFile('./templates/offermail.ejs', renderopt);

  try {
  const info = await global.smtp.mailer.sendMail({
      from: global.smtp.from,
      to: candidate.mail,
      subject: 'Dein Voucher',
      html: mailcontents,
  });
  } catch (e) {
    console.log(e);
    
    // set offer to timeout
    await VoucherMixerService.timeoutOffer(offer.id);
  }
  
}

setInterval(async () => {
  await checkFreeVouchers();
}, 1000 * 60 * 1);

// directly check for free vouchers
//checkFreeVouchers();

// Frequent check for timed out offers
setInterval(async () => {
  console.log('Checking for timed out offers...');
  await VoucherMixerService.updateInvalidOffersToTimeout();
}, 1000 * 60 * 1);

// Error handling
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const status = error.status || 500;
  const message = error.message || 'Something went wrong';
  let reason = null;

  if('reason' in error){
    reason = error.reason;
  }

 
  if (req.accepts('html')) {
    res.status(status).send('# Error ' + status + ' - ' + message);
  } else {
    res.status(status).json({status, message, reason});
  }
  
});


const server = https.createServer({ key: sslkey, cert: sslcert, passphrase: config.service.sslpass }, app); 

server.on('error', (e) => {
  console.log(e.name);
  if (e.name === 'EADDRINUSE') {
    console.log('Address in use, retrying...');
    setTimeout(() => {
      server.close();
      server.listen(port);
    }, 1000);
  }
});    

server.listen(port);