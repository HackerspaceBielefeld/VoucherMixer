
export const ServiceTokenQueries = {
    getAllServiceTokens: `SELECT * FROM service_token`,

    getByTokenvalue: `SELECT * FROM service_token WHERE tokenvalue = ?`,
   
    insertServiceToken: `INSERT INTO service_token (tokenvalue, created, validto, usecase, comment)
    VALUES (?, ?, ?, ?, ?)`,

    deleteServiceToken: `DELETE FROM service_token WHERE tokenvalue = ?`,

}
