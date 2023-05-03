import { NextFunction, Request, Response } from 'express';
import config from '../config/config.js';
import sql, { ConnectionPool, IProcedureResult, Request as SqlRequest } from 'mssql';
import logging from '../config/logging.js';

const NAMESPACE = 'server';
const METHOD = 'phone controller';

const pool = new ConnectionPool(config.data);
pool.connect((err) => {
    if (err) {
        logging.error(NAMESPACE, `METHOD: ${METHOD}: Error connecting to MSSQL database: ${err}`);
    } else {
        logging.info(NAMESPACE, `METHOD:  ${METHOD}: Connected to MSSQL database`);
    }
});

const getPhonesById = async (req: Request, res: Response) => {
    try {
        const request = new SqlRequest(pool);
        const result = await request.input('id', sql.Int, req.params.id).query('SELECT * FROM Person.PersonPhone WHERE BusinessEntityId = @id');
        if (result.recordset.length === 0) {
            res.status(404).send('Phone not found');
        } else {
            // Need to sanitize the data coming in from the database.
            res.send(result.recordset[0]);
        }
    } catch (err) {
        logging.error(NAMESPACE, `METHOD: [METHOD]: Error getting Phone: ${err}`);
        //console.log(`Error getting Phone: ${err}`);
        res.status(500).send(`Internal server error ' + ${err}`);
    }
};

export default {
    getPhonesById
};
