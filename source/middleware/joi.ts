import { Request, Response, NextFunction } from 'express';
import Joi, { ObjectSchema } from 'joi';
import { IPerson } from '../interfaces/person';

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

export const JoiSchemas = {
    businessEntity: Joi.object({
        username: Joi.string().alphanum().min(3).max(15).required(),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
            .required(),
        birth_year: Joi.number().integer().min(1900).max(2013)
    }),

    person: Joi.object<IPerson>({        
        personType: Joi.string().min(2),
        firstName: Joi.string().pattern(new RegExp('^[a-zA-Z]{3, 50}$')),
        middleName: Joi.string(),
        lastName: Joi.string()
    })
};
