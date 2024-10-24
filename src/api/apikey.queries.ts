
export const ApiKeyQueries = {
    getAllApiKeys: `SELECT * FROM api_key`,
   
    insertApiKey: `INSERT INTO api_key (id, keyvalue, description, validfrom, validto, usecase)
    VALUES (?, ?, ?, ?, ?, ?)`,

    updateApiKey: `
    UPDATE api_key SET keyvalue = ?, description = ?, validfrom = ?, validto = ?, usecase = ? WHERE id = ?
    `,
    
    deleteApiKey: `DELETE FROM api_key WHERE id = ?`,

}
