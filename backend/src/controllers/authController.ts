import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { PasswordUtil } from '../utils/password';
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { AuthService } from "../service/authService";
import pool from "../config/db";


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

        if (user.is_active === false) {
            throw new AppError("Tài khoản của bạn đã bị khóa, vui lòng liên hệ Admin!", 403);
        }

        if (!user.password) {
            throw new AppError("Email hoặc mật khẩu không chính xác!", 401);
        }

        const isMatch = await PasswordUtil.compare(password, user.password);
        if (!isMatch) {
            throw new AppError("Email hoặc mật khẩu không chính xác!", 401);
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('FATAL: JWT_SECRET is not defined in environment variables');
        }

        // Generate both access token and refresh token

        const accessToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET as string,
            { expiresIn: '7d' }
        );

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await pool.query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [user.id, refreshToken, expiresAt]
        );

        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
        });


        res.status(200).json({
            status: 'success',
            message: 'Đăng nhập thành công',
            data: { user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } }
        });
    });

    static refreshToken = asyncHandler(async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) throw new AppError("Không tìm thấy Refresh Token", 401);

        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as any;

            const [rows]: any = await pool.query(
                'SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ?',
                [refreshToken, decoded.id]
            );
            if (rows.length === 0) throw new AppError("Refresh Token không hợp lệ hoặc đã bị thu hồi", 403);

            const [user]: any = await pool.query(
                'SELECT role FROM users WHERE id = ?',
                [decoded.id]
            );

            if (user.length === 0) throw new AppError("Người dùng không tồn tại", 404);

            const newAccessToken = jwt.sign(
                { id: decoded.id, role: user[0].role },
                process.env.JWT_SECRET as string,
                { expiresIn: '15m' }
            );

            res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000
            });
            res.status(200).json({ status: 'success', message: 'Token đã được làm mới' });
        } catch (error) {
            throw new AppError("Refresh Token đã hết hạn hoặc không hợp lệ", 403);
        }
    })

    static getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user?.id) throw new AppError("Không tìm thấy thông tin đăng nhập", 401);

        const user = await AuthService.getUserById(req.user.id);
        if (!user) throw new AppError("Không tìm thấy người dùng", 404);

        res.status(200).json({ status: 'success', data: user });
    });

    static changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Không tìm thấy thông tin đăng nhập", 401);

        const { old_password, new_password } = req.body;

        const storedPasswordHash = await AuthService.getUserPasswordHashById(userId);
        if (!storedPasswordHash) throw new AppError("Không tìm thấy người dùng", 404);

        const isMatch = await PasswordUtil.compare(old_password, storedPasswordHash);
        if (!isMatch) {
            throw new AppError("Mật khẩu cũ không chính xác!", 400);
        }

        const hashedNewPassword = await PasswordUtil.hash(new_password);
        const updated = await AuthService.updatePassword(userId, hashedNewPassword);
        if (!updated) throw new AppError("Không thể cập nhật mật khẩu mới!", 500);

        res.status(200).json({
            status: "success",
            message: "Đổi mật khẩu thành công!"
        });
    });

    static logout = asyncHandler(async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            await pool.query('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
        }

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.status(200).json({ status: 'success', message: 'Đăng xuất thành công' });
    });



}
