import { execdbobj, execdblist, execute } from "./../db/mysql.connector";

import { ApiKeyQueries } from "./apikey.queries";
import { DBApiKey, DBApiKeyList } from "./apikey.model";

export const getAllApiKeys = async () => {
    const result = await execdblist<DBApiKeyList, DBApiKey>(DBApiKeyList, DBApiKey, ApiKeyQueries.getAllApiKeys, []);
    return result;
};


