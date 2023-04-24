import { Request, Response, NextFunction } from 'express';
import Joi, { ObjectSchema } from 'joi';
import { IJoiPerson } from '../interfaces/person';

export const JoiValidate = (schema: ObjectSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.validateAsync(req.body);
            next();
        } catch (error) {
            return res.status(422).json(error); // Unprocessable Entity.
        }
    };
};

export const JoiSchema = {
    JoiPerson: Joi.object<IJoiPerson>({
        personType: Joi.string().min(2),
        firstName: Joi.string().pattern(new RegExp('^[a-zA-Z]{3, 50}$')),
        middleName: Joi.string(),
        lastName: Joi.string()
    })
};
