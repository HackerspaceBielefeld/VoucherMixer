import { execute, execdbobj, execdblist } from "../db/mysql.connector";
import { DBCandidate } from "./candidate.model";
import { TDeliveryToStr } from "./generated/offer.model";
import { DBOffer } from "./offer.model";
import { DBVoucher } from "./voucher.model";

export const getVoucherById = async (id: number): Promise<DBVoucher | undefined> => {
    const query = "SELECT * FROM voucher WHERE id = ?";
    return await execdbobj<DBVoucher>(DBVoucher, query, [id]);
}

export const insertVoucher = async (parent: number | undefined, code: string): Promise<number> => {
    const query = "INSERT INTO voucher (parent, code, created) VALUES (?, ?, NOW())";
    return await execute(query, [parent, code]);
}

export const updateInvalidOffersToTimeout = async () => {
    const query = "UPDATE offer SET delivery = 'TIMEOUT' WHERE delivery = 'OPEN' AND validto < NOW()";
    await execute(query, []);
}

export const getNextCandidate = async (): Promise<DBCandidate | undefined> => {
    //const query = "SELECT id, mail, (timeoutrequests DIV 2) + distributionround AS distributionround, completed FROM (SELECT *, (SELECT COUNT(*) FROM offer WHERE offer.candidateid = candidate.id) AS allrequests, (SELECT COUNT(*) FROM offer WHERE offer.candidateid = candidate.id AND offer.delivery = 'TIMEOUT') AS timeoutrequests, (SELECT COUNT(*) FROM offer WHERE offer.candidateid = candidate.id AND offer.delivery = 'OPEN' ) AS openrequests FROM candidate WHERE completed = 0 ) AS requests WHERE requests.openrequests = 0 ORDER BY distributionround ASC, allrequests ASC LIMIT 1";
    // now with random
    const query = "SELECT id, mail, (timeoutrequests DIV 2) + distributionround AS distributionround, completed FROM (SELECT *, (SELECT COUNT(*) FROM offer WHERE offer.candidateid = candidate.id) AS allrequests, (SELECT COUNT(*) FROM offer WHERE offer.candidateid = candidate.id AND offer.delivery = 'TIMEOUT') AS timeoutrequests, (SELECT COUNT(*) FROM offer WHERE offer.candidateid = candidate.id AND offer.delivery = 'OPEN' ) AS openrequests, RAND() AS r FROM candidate WHERE completed = 0 ) AS requests WHERE requests.openrequests = 0 ORDER BY distributionround ASC, allrequests ASC, r ASC LIMIT 1";
    return await execdbobj<DBCandidate>(DBCandidate, query, []);
}

export const getSingleFreeVoucher = async (): Promise<DBVoucher | undefined> => {
    const query = "SELECT id, parent, code, used FROM (SELECT *, (SELECT COUNT(*) FROM offer WHERE offer.voucherid = voucher.id AND offer.delivery IN ('OPEN', 'DELIVERED')) AS inuse FROM voucher WHERE used IS NULL) AS v WHERE v.inuse = 0 LIMIT 1";

    return await execdbobj<DBVoucher>(DBVoucher, query, []);
}

export const getOfferById = async (id: number): Promise<DBOffer | undefined> => {
    const query = "SELECT * FROM offer WHERE id = ?";
    return await execdbobj<DBOffer>(DBOffer, query, [id]);
}

export const getOfferByCollectionPermit = async (collectionpermit: string): Promise<DBOffer | undefined> => {
    const query = "SELECT * FROM offer WHERE collectionpermit = ?";
    return await execdbobj<DBOffer>(DBOffer, query, [collectionpermit]);
}

export const rejectOffer = async (offerid: number) => {
    // get offer
    const offer = await getOfferById(offerid);
    if (offer == undefined) {
        return;
    }
    
    const query = "UPDATE offer SET delivery = 'REJECT' WHERE id = ?";
    await execute(query, [offerid]);

    // update candidate to completed
    const candidateQuery = "UPDATE candidate SET completed = 1 WHERE id = ?";
    await execute(candidateQuery, [offer.candidateid]);
}

export const timeoutOffer = async (offerid: number) => {
    const query = "UPDATE offer SET delivery = 'TIMEOUT' WHERE id = ?";
    await execute(query, [offerid]);
}

export const insertOffer = async (offer: DBOffer): Promise<number> => {
    const query = "INSERT INTO offer (candidateid, voucherid, collectionpermit, created, validto, delivery) VALUES (?, ?, ?, ?, ?, ?)";
    return await execute(query, [offer.candidateid, offer.voucherid, offer.collectionpermit, offer.created, offer.validto, TDeliveryToStr(offer.delivery)]);
}

export const acceptOffer = async (offerid: number): Promise<DBVoucher | undefined> => {
    // get offer
    const offer = await getOfferById(offerid);
    if (offer == undefined) {
        return;
    }

    // update voucher to used
    const voucherQuery = "UPDATE voucher SET used = NOW() WHERE id = ?";
    await execute(voucherQuery, [offer.voucherid]);

    // update candidate to completed
    const candidateQuery = "UPDATE candidate SET completed = 1 WHERE id = ?";
    await execute(candidateQuery, [offer.candidateid]);

    // update offer to delivered
    const offerQuery = "UPDATE offer SET delivery = 'DELIVERED' WHERE id = ?";
    await execute(offerQuery, [offerid]);

    // return voucher
    return await getVoucherById(offer.voucherid);
}

