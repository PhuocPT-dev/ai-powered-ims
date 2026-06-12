import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,

        // chỉ in lỗi khi đang code trên máy
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    })



}