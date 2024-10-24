import { execdbobj } from "../db/mysql.connector";
import { DBServiceToken } from "./servicetoken.model";
import { ServiceTokenQueries } from "./servicetoken.queries";

export const getByTokenvalue = async(tokenvalue: string): Promise<DBServiceToken | undefined> => {
    return await execdbobj<DBServiceToken>(DBServiceToken, ServiceTokenQueries.getByTokenvalue, [tokenvalue]);
}
