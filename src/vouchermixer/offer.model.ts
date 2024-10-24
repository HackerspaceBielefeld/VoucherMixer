

import { GenericDBObject, GenericDBObjectList } from '../db/genericdbobject';
import { GeneratedDBOffer } from './generated/offer.model';

export class DBOfferList extends GenericDBObjectList<DBOffer> {

}

export class DBOffer extends GeneratedDBOffer {

}

