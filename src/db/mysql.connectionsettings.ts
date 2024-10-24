

export class MySQLConnectionSettings {    
    constructor(public connectionLimit: number, public hostname: string, public port: number, public database: string, public username: string, public password: string){

    }

    static createFromIni(data: any) {

        let connectionLimit = 5;
        if(data?.connectionlimit !== undefined){
            if(typeof data.connectionLimit === 'number'){
            connectionLimit = data.connectionLimit;
            }
        }

        let hostname = '';
        if(data?.hostname !== undefined){
            hostname = data.hostname.toString();
        }

        let port = 3306;
        if(data?.port !== undefined){
            port = Number.parseInt(data.port);
        }

        let database = '';
        if(data?.database !== undefined){
            database = data.database.toString();
        }

        let username = '';
        if(data?.username !== undefined){
            username = data.username.toString();
        }

        let password = '';
        if(data?.password !== undefined){
            password = data.password.toString();
        }

        return new MySQLConnectionSettings(connectionLimit, hostname, port, database, username, password);
    }

}