import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

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
