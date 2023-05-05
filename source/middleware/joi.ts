import { Request, Response, NextFunction } from 'express';
import Joi, { ObjectSchema } from 'joi';
import { IPerson } from '../interfaces/person.js';
import { IPhone } from '../interfaces/phone.js';
import { IUser } from '../interfaces/user.js';

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
    user: Joi.object<IUser>({
        UserId: Joi.number(),
        UserName: Joi.string().alphanum().min(3).max(50).required(),
        FirstName: Joi.string().alphanum().min(3).max(50).required(),
        MiddleName: Joi.string().alphanum().min(2).max(50),
        LastName: Joi.string().alphanum().min(3).max(50).required(),
        Password: Joi.string().alphanum().min(3).max(50).required(),
        Active: Joi.boolean().default(true),
        CreateDate: Joi.date().required(),
        CreatedBy: Joi.string().alphanum().min(3).max(50).required(),
        ModifiedDate: Joi.date().required(),
        ModifiedBy: Joi.string().alphanum().min(3).max(50).required(),
    }),

    person: Joi.object<IPerson>({
        personType: Joi.string().min(2),
        firstName: Joi.string().pattern(new RegExp('^[a-zA-Z]{3, 50}$')),
        middleName: Joi.string().pattern(new RegExp('^[a-zA-Z]{3, 50}$')),
        lastName: Joi.string().pattern(new RegExp('^[a-zA-Z]{3, 50}$'))
    }),

    phone: Joi.object<IPhone>({
        phoneNumber: Joi.string()
            .regex(/^[0-9]{10}$/)
            .messages({ 'string.pattern.base': `Phone number must have 10 digits.` })
    })
};
