

import { GenericDBObject, GenericDBObjectList } from '../db/genericdbobject';
import { GeneratedDBServiceToken } from './generated/servicetoken.model';

export class DBServiceTokenList extends GenericDBObjectList<DBServiceToken> {

}

export class DBServiceToken extends GeneratedDBServiceToken {
    isValid(): boolean {
        const now = new Date();
        return (this.validto >= now);
    }
}

