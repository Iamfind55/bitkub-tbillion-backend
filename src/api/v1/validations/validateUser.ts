import { Request, Response, NextFunction } from 'express';
import { validationResult, check } from 'express-validator';

export const validateUser = [
    check('name').notEmpty().withMessage('Name is required'),
    check('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];