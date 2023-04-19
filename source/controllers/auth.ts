import { NextFunction, Request, Response } from 'express';
import config from '../config/config';
import { ConnectionPool } from 'mssql';
import jwt from 'jsonwebtoken';

const pool = new ConnectionPool(config.data);
pool.connect((err) => {
    if (err) {
        console.log(`Error connecting to MSSQL database: ${err}`);
    } else {
        console.log('Connected to MSSQL database');
    }
});

const authenticate = (req: Request, res: Response, next: NextFunction) => {
    // Use bodyparser to get username and password.
    // Find the user in the database and confirm the user is valid.

    const user = { id: 1 };
    const token = jwt.sign(user, 'my-secret-key');

    // For testing - just authorize for now.
    return res.status(200).json({
        token: token
    });
};

export default { authenticate };
