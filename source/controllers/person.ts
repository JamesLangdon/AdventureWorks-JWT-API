import { NextFunction, Request, Response } from 'express';
import config from '../config/config';
import sql, { ConnectionPool, Request as SqlRequest } from 'mssql';
import logging from '../config/logging';

const NAMESPACE = 'server';
const METHOD = 'person controller';
const pool = new ConnectionPool(config.data);

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
        const result = await request.input('id', sql.Int, req.params.id).query('SELECT * FROM Person.Person WHERE BusinessEntityId1 = @id');
        if (result.recordset.length === 0) {
            res.status(404).send('Person not found');
        } else {
            res.send(result.recordset[0]);
        }
    } catch (err) {
        logging.error(NAMESPACE, `METHOD: [METHOD]: Error getting person: ${err}`);
        //console.log(`Error getting person: ${err}`);
        res.status(500).send(`Internal server error ' + ${err}`);
    }
};

const createPerson = async (req: Request, res: Response) => {
    try {
        const { name, email } = req.body;
        const request = new SqlRequest(pool);
        const result = await request.input('name', sql.NVarChar, name).input('email', sql.NVarChar, email).query('INSERT INTO persons (name, email) VALUES (@name, @email)');
        res.status(201).send(result.recordset[0]);
    } catch (err) {
        logging.error(NAMESPACE, `METHOD: ${METHOD}: Error creating person: ${err}`);
        //console.log(`Error creating person: ${err}`);
        res.status(500).send('Internal server error');
    }
};

const updatePersonById = async (req: Request, res: Response) => {
    try {
        const { name, email } = req.body;
        const request = new SqlRequest(pool);
        const result = await request
            .input('id', sql.Int, req.params.id)
            .input('name', sql.NVarChar, name)
            .input('email', sql.NVarChar, email)
            .query('UPDATE persons SET name = @name, email = @email WHERE id = @id');
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
        const result = await request.input('id', sql.Int, req.params.id).query('DELETE FROM persons WHERE id = @id');
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
