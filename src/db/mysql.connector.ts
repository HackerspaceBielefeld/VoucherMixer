import { createPool, Pool} from 'mysql';
import { MySQLConnectionSettings } from './mysql.connectionsettings';
import { GenericDBObject, GenericDBObjectList } from './genericdbobject';

let pool: Pool;



/**
 * generates pool connection to be used throughout the app
 */
export const init = (connectionSettings: MySQLConnectionSettings) => {
  try {
    //console.log(connectionSettings);
    pool = createPool({

      connectionLimit: connectionSettings.connectionLimit,
      host:connectionSettings.hostname,
      user: connectionSettings.username,
      password: connectionSettings.password,
      database: connectionSettings.database,
    });

    console.debug('MySql Adapter Pool generated successfully');
  } catch (error) {
    console.error('[mysql.connector][init][Error]: ', error);
    throw new Error('failed to initialized pool');
  }
};

/**
 * executes SQL queries in MySQL db
 *
 * @param {string} query - provide a valid SQL query
 * @param {string[] | Object} params - provide the parameterized values used
 * in the query
 */


export const execdblist = <L extends GenericDBObjectList<T>, T extends GenericDBObject>(resulttype: any, resultitemtype: any, query: string, params: string[] | Object): Promise<L> => {
  try {
    if (!pool) throw new Error('Pool was not created. Ensure pool is created when running the app.');

    return new Promise<L>((resolve, reject) => {
      pool.query(query, params, (error, results) => {
        if (error) { reject(error); }
        else {
          const result = new resulttype();
          for(let i = 0; i < results.length; i++){
            result.Add(resultitemtype.createFromDB(results[i]));
          }
          resolve(result);
        }
      });
    });

  } catch (error) {
    console.error('[mysql.connector][execute][Error]: ', error);
    throw new Error('failed to execute MySQL query');
  }
}

export const execdbobj = <T extends GenericDBObject>(resultitemtype: any, query: string, params: string[] | Object): Promise<T | undefined> => {
  try {
    if (!pool) throw new Error('Pool was not created. Ensure pool is created when running the app.');

    return new Promise<T>((resolve, reject) => {
      pool.query(query, params, (error, results) => {
        if (error) { reject(error); }
        else {
          if (results.length > 1) throw new Error('Resultlength > 1');

          if (results.length == 0){
            // @ts-ignore
            resolve(undefined);
          } else {
            const result = resultitemtype.createFromDB(results[0]);
          
            resolve(result);
          }
        }
      });
    });

  } catch (error) {
    console.error('[mysql.connector][execute][Error]: ', error);
    throw new Error('failed to execute MySQL query');
  }
}


export const execute = <T>(query: string, params: string[] | Object): Promise<T> => {
  try {
    if (!pool) throw new Error('Pool was not created. Ensure pool is created when running the app.');

    return new Promise<T>((resolve, reject) => {
      pool.query(query, params, (error, results) => {
        if (error) reject(error);
        else resolve(results);
      });
    });

  } catch (error) {
    console.error('[mysql.connector][execute][Error]: ', error);
    throw new Error('failed to execute MySQL query');
  }
}