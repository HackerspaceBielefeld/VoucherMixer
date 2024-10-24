
import { GenericDBObject, TDBObjectView } from '../../db/genericdbobject';

export enum TDelivery {
  OPEN,
  DELIVERED,
  TIMEOUT,
  REJECT
}

export function TDeliveryToStr(val: TDelivery): string {
  switch(val){
    case TDelivery.OPEN: { return 'OPEN'; }
    case TDelivery.DELIVERED: { return 'DELIVERED'; }
    case TDelivery.TIMEOUT: { return 'TIMEOUT'; }
    case TDelivery.REJECT: { return 'REJECT'; }
  }
}

export function StrToTDelivery(val: string): TDelivery | undefined {
  switch(val){
    case 'OPEN': { return TDelivery.OPEN; }
    case 'DELIVERED': { return TDelivery.DELIVERED; }
    case 'TIMEOUT': { return TDelivery.TIMEOUT; }
    case 'REJECT': { return TDelivery.REJECT; }
    default: { return undefined; }
  }
}


interface IOffer {
    id: number;
    candidateid: number;
    voucherid: number;
    collectionpermit: string;
    created: Date;
    validto: Date;
    delivery: TDelivery;
}

export class GeneratedDBOffer extends GenericDBObject implements IOffer {
    
  constructor(
    public id: number,
    public candidateid: number,
    public voucherid: number,
    public collectionpermit: string,
    public created: Date,
    public validto: Date,
    public delivery: TDelivery
    ){
      super();
  }

  static createFromDB(data: any){
      // @ts-ignore
      return new this(data.id, data.candidateid, data.voucherid, data.collectionpermit, data.created, data.validto, StrToTDelivery(data.delivery));
  }

  public JSONView(view: TDBObjectView) {
    if(view == null){
      return {
        id: this.id,
        candidateid: this.candidateid,
        voucherid: this.voucherid,
        collectionpermit: this.collectionpermit,
        created: this.created,
        validto: this.validto,
        delivery: TDeliveryToStr(this.delivery)
      };
    }

    const result: any = {};
    if(view.includes('id')) { result.id = this.id; }
    if(view.includes('candidateid')) { result.candidateid = this.candidateid; }
    if(view.includes('voucherid')) { result.voucherid = this.voucherid; }
    if(view.includes('collectionpermit')) { result.collectionpermit = this.collectionpermit; }
    if(view.includes('created')) { result.created = this.created; }
    if(view.includes('validto')) { result.validto = this.validto; }
    if(view.includes('delivery')) { result.delivery = TDeliveryToStr(this.delivery); }
    return result;  
  }

}
