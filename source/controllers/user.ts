import { NextFunction, Request, Response } from 'express';
import config from '../config/config.js';
import sql, { ConnectionPool, IProcedureResult, Request as SqlRequest } from 'mssql';
import logging from '../config/logging.js';
import { IUser, IUserRecordCount } from '../interfaces/user.js';
import { IStoredProcedureError } from '../interfaces/storedProcedureError.js';
import { isNumberObject } from 'util/types';
import authController from '../controllers/auth.js';
import auth from '../controllers/auth.js';

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
        let { pageIndex, pageSize, lastName } = req.body;

        const request = new SqlRequest(pool);
        await request.input('PageIndex', sql.Int, pageIndex).input('PageSize', sql.Int, pageSize).input('PageSize', sql.Int, lastName).execute('UserSearch'),
            (err: string, result: IProcedureResult<[IUser[], IUserRecordCount]>) => {
                if (err) {
                    logging.error(NAMESPACE, `Error - UserSearch stored procedure: ${err}`);
                    res.status(500).send('Get Users Failed');
                    return;
                }
                const users = result.recordsets[0];
                const recordCount = result.recordsets[1];
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

        // ToDo: The request returns a result as IProcedureResult, so confirm if the database
        // returns something that does not match IUser, then it SHOULD fail.
        // This should satisfy protection if the database changes.

        await request.input('UserId', sql.Int, req.params.UserId).execute('GetUserById'),
            (err: string, result: IProcedureResult<IUser>) => {
                if (err) {
                    logging.error(NAMESPACE, `Error - GetUserById stored procedure: ${err}`);
                    res.status(404).send('Get User By Id Failed');
                    return;
                }
                res.status(200).send(result.recordset);
            };
    } catch (err) {
        logging.error(NAMESPACE, `Error - getById method: ${err}`);
        res.status(500).send(`Internal server error ' + ${err}`);
    }
};

const create = async (req: Request, res: Response) => {
    try {
        let { userName, firstName, middleName, lastName, password, active, currentUser, role } = req.body;
        let currentDate = new Date();
        let hashedPassword = authController.encryptPassword(password);

        const request = new SqlRequest(pool);
        await request
            .input('UserName', sql.NVarChar, userName)
            .input('Password', sql.NVarChar, hashedPassword)
            .input('FirstName', sql.NVarChar, firstName)
            .input('MiddleName', sql.NVarChar, middleName)
            .input('LastName', sql.NVarChar, lastName)
            .input('Active', sql.NVarChar, active)
            .input('CreateDate', sql.DateTime, currentDate)
            .input('CreatedBy', sql.NVarChar, currentUser)
            .input('ModifiedDate', sql.DateTime, currentDate)
            .input('ModifiedBy', sql.NVarChar, currentUser)
            .input('Role', sql.NVarChar, role)
            .execute('CreateUser'),
                (err: string, result: IProcedureResult<IUser>) =>
                    {
                        if (err) {
                            logging.error(NAMESPACE, `Error - CreatePerson stored procedure: ${err}`);
                            res.status(500).send('Create User Failed');
                            return;
                        }

                        // Status 201 - request has succeeded and has led to the creation of a resource.
                        res.status(201).send(result.recordset);
                    };
    } catch (err) {
        logging.error(NAMESPACE, `Error - create method: ${err}`);
        res.status(500).send('Create User Failed');
    }
};

const updateById = async (req: Request, res: Response) => {
    try {
        let { userId, userName, firstName, middleName, lastName, password, active, currentUser } = req.body;
        let currentDate = new Date();
        let hashedPassword = authController.encryptPassword(password);

        // The UpdateUserById stored procedure will only update fields that have been changed.
        const request = new SqlRequest(pool);
        await request
            .input('UserId', sql.Int, userId)
            .input('UserName', sql.NVarChar, userName)
            .input('Password', sql.NVarChar, hashedPassword)
            .input('FirstName', sql.NVarChar, firstName)
            .input('MiddleName', sql.NVarChar, middleName)
            .input('LastName', sql.NVarChar, lastName)
            .input('Active', sql.Bit, active)
            .input('ModifiedDate', sql.NVarChar, currentDate)
            .input('ModifiedBy', sql.NVarChar, currentUser)
            .execute('UpdateUserById'),
             (err: string, result: IProcedureResult<IUser>) => {
                if (err) {
                    logging.error(NAMESPACE, `Error - UpdateUserById stored procedure: ${err}`);
                    res.status(404).send('User Not Found');
                    return;
                }
                // 204 - No Content success status response code indicates that a request has succeeded.
                res.status(204).send(result.recordset);
            };
    } catch (err) {
        logging.error(NAMESPACE, `Error - updateById method: ${err}`);
        res.status(500).send('Internal server error');
    }
};

const deleteById = async (req: Request, res: Response) => {
    try {
        const request = new SqlRequest(pool);
        const userId = req.params.UserId;
        await request.input('UserId', sql.Int, req.params.UserId).execute('DeleteUserById'),
        (err: string, result: IProcedureResult<IStoredProcedureError>, returnValue: number) => {
            if (result.returnValue == 0){
                // 204 - No Content success status response code indicates that a request has succeeded.
                res.status(204);
            } else {
                // The delete failed.
                // The recordset returned is of the type IStoredProcedureError.
                logging.error(NAMESPACE, `Error - deleteById method: ${result.recordset}`);
                res.status(500).send(`Internal server error`);
                return;    
            }   
        }
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
