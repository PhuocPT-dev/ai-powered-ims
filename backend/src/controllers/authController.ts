import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { PasswordUtil } from '../utils/password';
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { AuthService } from "../service/authService";

export class AuthController {
    static register = asyncHandler(async (req: Request, res: Response) => {
        const { email, password, full_name, phone } = req.body;

        const existingUser = await AuthService.getUserByEmail(email);
        if (existingUser) {
            throw new AppError("Email này đã được sử dụng!", 400);
        }

        const hashedPassword = await PasswordUtil.hash(password);
        const userRole = 'CANDIDATE';
        
        await AuthService.createUser(email, hashedPassword, full_name, phone, userRole);
        
        res.status(201).json({
            status: "success",
            message: "Đăng ký thành công!"
        });
    });

    static login = asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const user = await AuthService.getUserByEmail(email);
        if (!user) {
            throw new AppError("Email hoặc mật khẩu không chính xác!", 401);
        }

        if (user.is_active === 0) {
            throw new AppError("Tài khoản của bạn đã bị khóa, vui lòng liên hệ Admin!", 403);
        }

        const isMatch = await PasswordUtil.compare(password, user.password);
        if (!isMatch) {
            throw new AppError("Email hoặc mật khẩu không chính xác!", 401);
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('FATAL: JWT_SECRET is not defined in environment variables');
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            status: "success",
            message: "Đăng nhập thành công!",
            data: {
                token: token,
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    role: user.role,
                    email: user.email
                }
            }
        });
    });

    static getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user?.id) throw new AppError("Không tìm thấy thông tin đăng nhập", 401);
        
        const user = await AuthService.getUserById(req.user.id);
        if (!user) throw new AppError("Không tìm thấy người dùng", 404);
        
        res.status(200).json({ status: 'success', data: user });
    });
}
