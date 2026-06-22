import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';

type RequestType = Request | AuthRequest;

export const asyncHandler = <T extends RequestType = Request>(
    fn: (req: T, res: Response, next: NextFunction) => Promise<void>
) => {
    return (req: T, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
