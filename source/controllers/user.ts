import { NextFunction, Request, Response } from 'express';
import config from '../config/config.js';
import sql, { ConnectionPool, IProcedureResult, Request as SqlRequest } from 'mssql';
import logging from '../config/logging.js';
import { IUser } from '../interfaces/user.js';
import { isNumberObject } from 'util/types';

const NAMESPACE = 'user controller';

const pool = new ConnectionPool(config.data);
pool.connect((err) => {
    if (err) {
        logging.error(NAMESPACE, `Error connecting to MSSQL database: ${err}`);
    } else {
        logging.info(NAMESPACE, `Connected to MSSQL database`);
    }
});

const getAll = async (req: Request, res: Response) => {
    try {
        const request = new SqlRequest(pool);

        let { pageIndex, pageSize, lastName } = req.body;
        /*
        let pageIndex = req.body.PageIndex;
        let pageSize = req.body.PageSize;
        let lastName = req.body.LastName;
        */

        await request.input('PageIndex', sql.Int, pageIndex).input('PageSize', sql.Int, pageSize).input('PageSize', sql.Int, lastName).execute('UserSearch'),
            (err: string, result: any) => {
                if (err) {
                    logging.error(NAMESPACE, `Error - UserSearch stored procedure: ${err}`);
                    res.status(500).send('Get Users Failed');
                    return;
                }
                const users: IUser[] = result.recordsets[0];
                const recordCount: number = result.recordsets[1];
                res.status(200).json({ users, recordCount });
            };
    } catch (err) {
        logging.error(NAMESPACE, `Error - getAll method: ${err}`);
        res.status(500).send('Internal server error');
    }
};

const getById = async (req: Request, res: Response) => {
    try {
        const request = new SqlRequest(pool);
        request.input('UserId', sql.Int, req.params.UserId).execute('GetUserById', (err, recordset, returnValue) => {
            if (err) {
                logging.error(NAMESPACE, `Error - GetUserById stored procedure: ${err}`);
                res.status(404).send('Get User By Id Failed');
                return;
            }
            // Is the User from the database what we expect?
            const user = recordset?.output as IUser;

            res.status(200).send(recordset);
        });
    } catch (err) {
        logging.error(NAMESPACE, `Error - getById method: ${err}`);
        res.status(500).send(`Internal server error ' + ${err}`);
    }
};

const create = async (req: Request, res: Response) => {
    try {
        let { userName, firstName, middleName, lastName, password, active, currentUser } = req.body;
        let currentDate = new Date();

        /*
        let userName = req.body.UserName;
        let firstName = req.body.FirstName;
        let middleName = req.body.MiddleName;
        let lastName = req.body.LastName;
        let active = req.body.Active;
        */

        const request = new SqlRequest(pool);
        request
            .input('UserName', sql.NVarChar, userName)
            .input('FirstName', sql.NVarChar, firstName)
            .input('MiddleName', sql.NVarChar, middleName)
            .input('LastName', sql.NVarChar, lastName)
            .input('Password', sql.NVarChar, password)
            .input('Active', sql.NVarChar, active)
            .input('CreateDate', sql.DateTime, currentDate)
            .input('CreatedBy', sql.NVarChar, currentUser)
            .input('ModifiedDate', sql.DateTime, currentDate)
            .input('ModifiedBy', sql.NVarChar, currentUser)
            .execute('CreateUser', (err, recordset, returnValue) => {
                if (err) {
                    logging.error(NAMESPACE, `Error - CreatePerson stored procedure: ${err}`);
                    res.status(500).send('Create User Failed');
                    return;
                }

                // Confirm the database returned a valid user.
                const user = recordset?.output as IUser;

                res.status(201).send(recordset);
            });
    } catch (err) {
        logging.error(NAMESPACE, `Error - create method: ${err}`);
        res.status(500).send('Create User Failed');
    }
};

const updateById = async (req: Request, res: Response) => {
    try {
        let { userId, userName, firstName, middleName, lastName, password, active, currentUser } = req.body;

        /*
        let userId = req.body.UserId;
        let userName = req.body.UserName;
        let firstName = req.body.FirstName;
        let middleName = req.body.MiddleName;
        let lastName = req.body.LastName;
        let active = req.body.Active;
        */

        const request = new SqlRequest(pool);
        request
            .input('UserId', sql.Int, userId)
            .input('UserName', sql.NVarChar, userName)
            .input('FirstName', sql.NVarChar, firstName)
            .input('MiddleName', sql.NVarChar, middleName)
            .input('LastName', sql.NVarChar, lastName)
            .input('Active', sql.Bit, active)
            .execute('UpdateUserById', (err, recordset, returnValue) => {
                if (err) {
                    logging.error(NAMESPACE, `Error - UpdateUserById stored procedure: ${err}`);
                    res.status(404).send('User Not Found');
                    return;
                }

                // Confirm the database returned a valid user.
                const user = recordset?.output as IUser;

                res.status(204).send(user);
            });
    } catch (err) {
        logging.error(NAMESPACE, `Error - updateById method: ${err}`);
        res.status(500).send('Internal server error');
    }
};

const deleteById = async (req: Request, res: Response) => {
    try {
        const request = new SqlRequest(pool);
        const userId = req.params.UserId;
        request.input('UserId', sql.Int, req.params.UserId).execute('DeleteUserById', (err, recordset, returnValue) => {
            if (err) {
                logging.error(NAMESPACE, `Error - DeleteUserById stored procedure: ${err}`);
                res.status(404).send('User Not Found');
                return;
            }
            res.status(204);
        });
    } catch (err) {
        logging.error(NAMESPACE, `Error - deleteById method: ${err}`);
        res.status(500).send('Internal server error');
    }
};

export default {
    getAll,
    getById,
    create,
    updateById,
    deleteById
};
