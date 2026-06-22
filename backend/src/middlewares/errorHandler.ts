import { Request, Response, NextFunction } from 'express';

interface AppErrorShape {
    statusCode?: number;
    status?: string;
    message: string;
    isOperational?: boolean;
    stack?: string;
}

export const errorHandler = (
    err: AppErrorShape,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';

    // Log lỗi server (5xx) ra Console để dễ dàng debug
    if (statusCode >= 500) {
        console.error(`[ERROR ${statusCode}] ${req.method} ${req.path}:`, err.stack || err.message);
    }

    res.status(statusCode).json({
        status,
        message: err.message,
        // Chỉ in chi tiết lỗi (stack) khi đang code trên máy (development)
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};