import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

export const validate = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        } catch (error: any) {
            const message = (error.issues && error.issues.length > 0) ? error.issues[0].message : " Lỗi định dạng dữ liệu";
            next(new AppError(message, 400));
        }
    }
}