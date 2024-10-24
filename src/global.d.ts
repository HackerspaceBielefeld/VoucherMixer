export interface global {}

declare global {
  var apikeys: any;
  var aclstore: AclStore;
  var smtp: {mailer: any, from: string?};
  

  namespace Express {
    export interface Request {
      token?: {present: boolean, valid: boolean, userid: number | undefined, usecase: Array<String>};
    }
  }
}
