import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import pool from "../config/db";
import { PasswordUtil } from '../utils/password';
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

export class AuthController {
    // Hàm xử lý đăng ký (Dùng static gỏi thẳng từ class mà không cần tạo Object)
    static register = asyncHandler(async (req: Request, res: Response) => {
        const { email, password, full_name, phone } = req.body;

        const [existingUsers]: any = await pool.query(
            'SELECT id FROM users WHERE email = ?', [email]
        );
        if (existingUsers.length > 0) {
            throw new AppError("Email này đã được sử dụng!", 400);
        }

        const hashedPassword = await PasswordUtil.hash(password);

        // BẢO MẬT: Luôn ép cứng Role là CANDIDATE khi đăng ký (Phòng chống Hacker tự thăng cấp ADMIN)
        const userRole = 'CANDIDATE';
        await pool.query(
            'INSERT INTO users (email, password, full_name, phone, role) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, full_name, phone, userRole]
        );
        res.status(201).json({
            status: "success",
            message: "Đăng ký thành công!"
        });
    });

    //Hàm xử lý Đăng nhập
    static login = asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const [users]: any = await pool.query(
            'SELECT id, email, password, full_name, role, is_active FROM users WHERE email = ?', 
            [email]
        );

        if (users.length === 0) {
            throw new AppError("Email hoặc mật khẩu không chính xác!", 401);
        }

        const user = users[0];

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
        const secretKey = process.env.JWT_SECRET;

        const token = jwt.sign(
            { id: user.id, role: user.role },
            secretKey,
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
        const [users]: any = await pool.query(
            'SELECT id, email, full_name, role FROM users WHERE id = ?',
            [req.user?.id]
        );
        res.status(200).json({ status: 'success', data: users[0] });
    });
}

