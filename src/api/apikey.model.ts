

import { GenericDBObject, GenericDBObjectList } from '../db/genericdbobject';
import { GeneratedDBApiKey } from './generated/apikey.model';

export class DBApiKeyList extends GenericDBObjectList<DBApiKey> {
    isValid(keyvalue: String): boolean {
        for (var i = 0; i < this.length; i++) {
            if (this.Item(i).keyvalue == keyvalue) {
                if (this.Item(i).isValid()) {
                    return true;
                }
            }
        }
        return false;
    }
}

export class DBApiKey extends GeneratedDBApiKey {

    isValid(): boolean {
        const now = new Date();
        return ((this.validfrom <= now) && (this.validto >= now));
    }
}

