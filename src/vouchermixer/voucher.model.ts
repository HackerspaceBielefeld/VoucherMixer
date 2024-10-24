

import { GenericDBObject, GenericDBObjectList } from '../db/genericdbobject';
import { GeneratedDBVoucher } from './generated/voucher.model';

export class DBVoucherList extends GenericDBObjectList<DBVoucher> {

}

export class DBVoucher extends GeneratedDBVoucher {

}

