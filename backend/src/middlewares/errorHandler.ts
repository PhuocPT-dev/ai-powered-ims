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
    let statusCode = err.statusCode || 500;
    let status = err.status || 'error';
    let message = err.message;

    // Xử lý lỗi trùng lặp (Duplicate Entry) từ cơ sở dữ liệu MySQL
    if ((err as any).code === 'ER_DUP_ENTRY') {
        statusCode = 400;
        status = 'fail';
        message = 'Email hoặc dữ liệu này đã được sử dụng trong hệ thống!';
    }

    // Log lỗi server (5xx) ra Console để dễ dàng debug
    if (statusCode >= 500) {
        console.error(`[ERROR ${statusCode}] ${req.method} ${req.path}:`, err.stack || err.message);
    }

    res.status(statusCode).json({
        status,
        message,
        // Chỉ in chi tiết lỗi (stack) khi đang code trên máy (development)
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};