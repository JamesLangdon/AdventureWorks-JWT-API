import { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import sql, { ConnectionPool, Request as SqlRequest } from 'mssql';
import logging from '../config/logging.js';

dotenv.config();

const authenticate = (req: Request, res: Response, next: NextFunction) => {
    // Find the user in the database and confirm the user is valid.
    const userName = req.body.username;
    const password = req.body.password;

    const user = { id: 1 };
    const token = jwt.sign(user, 'my-secret-key');

    // For testing - just authorize for now.
    return res.status(200).json({
        token: token
    });
};

function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    const secret = process.env.ACCESS_TOKEN_SECRET as string;
    jwt.verify(token, secret, (err, user) => {
        console.log(err);
        if (err) return res.sendStatus(403);
        req.body.username = user;
        next();
    });
}

export default { authenticate, authenticateToken };
