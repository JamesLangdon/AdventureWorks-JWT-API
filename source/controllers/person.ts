import { NextFunction, Request, Response } from 'express';
import config from '../config/config';
import sql, { ConnectionPool, IProcedureResult, Request as SqlRequest } from 'mssql';
import logging from '../config/logging';
import { IPerson } from '../interfaces/person';

const NAMESPACE = 'server';
const METHOD = 'person controller';

// Initialize the ConnectionPool.
const pool = new ConnectionPool(config.data);
pool.connect((err) => {
    if (err) {
        logging.error(NAMESPACE, `METHOD: ${METHOD}: Error connecting to MSSQL database: ${err}`);
    } else {
        logging.info(NAMESPACE, `METHOD:  ${METHOD}: Connected to MSSQL database`);
    }
});

const serverHealthCheck = (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json({
        message: 'pong'
    });
};

const getAllPersons = async (req: Request, res: Response) => {
    try {
        const request = new SqlRequest(pool);
        const result = await request.query('SELECT top 10 * FROM Person.Person');
        res.send(result.recordset);
    } catch (err) {
        logging.error(NAMESPACE, `METHOD: ${METHOD}: Error getting persons: ${err}`);
        res.status(500).send('Internal server error');
    }
};

const getPersonById = async (req: Request, res: Response) => {
    try {
        const request = new SqlRequest(pool);
        const result = await request
            .input('id', sql.Int, req.params.id)
            .query('SELECT PersonType, FirstName, MiddleName, LastName FROM Person.Person WHERE BusinessEntityId = @id');
        if (result.recordset.length === 0) {
            res.status(404).send('Person not found');
        } else {
            // Is the Person from the database what we expect?
            const person = result.recordset[0] as IPerson;
            if (person){
                // Person is valid.
                res.send(result.recordset[0]);
            } else {
                // Person in response was NOT what was expected. 400 - Bad Request.
                res.status(400).send(`The database response was not a valid person.`);
            }
        }
    } catch (err) {
        logging.error(NAMESPACE, `METHOD: [METHOD]: Error getting person: ${err}`);        
        res.status(500).send(`Internal server error ' + ${err}`);
    }
};

const createPerson = async (req: Request, res: Response) => {
    try {
        const { PersonType, FirstName, MiddleName, LastName } = req.body;
        let personType = req.body.PersonType;
        let firstName = req.body.FirstName;
        let middleName = req.body.MiddleName;
        let lastName = req.body.LastName;
        const request = new SqlRequest(pool);
        // IProcedureResult.
        const result = await request
            .input('PersonType', sql.NVarChar, personType)
            .input('FirstName', sql.NVarChar, firstName)
            .input('MiddleName', sql.NVarChar, middleName)
            .input('LastName', sql.NVarChar, lastName)
            .execute('CreatePerson', (err, recordset, returnValue) => {
                if ((err = null == undefined)) {
                    res.status(201).send(recordset);
                } else {
                    logging.error(NAMESPACE, `METHOD: ${METHOD}: Error creating person: ${err}`);
                    res.status(500).send('Create Person Failed');
                }
            });
    } catch (err) {
        logging.error(NAMESPACE, `METHOD: ${METHOD}: Error creating person: ${err}`);
        res.status(500).send('Create Person Failed');
    }
};

const updatePersonById = async (req: Request, res: Response) => {
    try {
        const request = new SqlRequest(pool);
        const personType = req.body.PersonType;
        const firstName = req.body.FirstName;
        const middleName = req.body.MiddleName;
        const lastName = req.body.LastName;
        const result = await request
            .input('PersonType', sql.NVarChar, personType)
            .input('FirstName', sql.NVarChar, firstName)
            .input('MiddleName', sql.NVarChar, middleName)
            .input('LastName', sql.NVarChar, lastName).query(`UPDATE Person.Person 
                SET 
                    PersonType = @personType, 
                    FirstName = @firstName,
                    MiddleName = @middleName,
                    LastName = @lastName
                WHERE BusinessEntityId = req.params.id`);
        if (result.rowsAffected[0] === 0) {
            res.status(404).send('person not found');
        } else {
            res.sendStatus(204);
        }
    } catch (err) {
        logging.error(NAMESPACE, `METHOD: ${METHOD}: Error updating person: ${err}`);
        //console.log(`Error updating person: ${err}`);
        res.status(500).send('Internal server error');
    }
};

const deletePersonById = async (req: Request, res: Response) => {
    try {
        const request = new SqlRequest(pool);
        const businessEntityId = req.params.BusinessEntityId;
        const result = await request.input('BusinessEntityId', sql.Int, req.params.id).query('DELETE FROM Person.Person WHERE BusinessEntityId = @businessEntityId');
        if (result.rowsAffected[0] === 0) {
            res.status(404).send('person not found');
        } else {
            res.sendStatus(204);
        }
    } catch (err) {
        logging.error(NAMESPACE, `METHOD: ${METHOD}: Error deleting person: ${err}`);
        //console.log(`Error deleting person: ${err}`);
        res.status(500).send('Internal server error');
    }
};

export default {
    serverHealthCheck,
    getAllPersons,
    getPersonById,
    createPerson,
    updatePersonById,
    deletePersonById
};
