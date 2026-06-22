import { Request, Response } from "express"
import pool from "../config/db";
import { PasswordUtil } from '../utils/password';
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import crypto from 'crypto';

export class AdminController {
    static toggleUserStatus = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.params.id;
        const { is_active } = req.body // Bắt giá trị: true = Mở, false = Khóa

        const [result]: any = await pool.query('UPDATE users SET is_active = ? WHERE id = ?',
            [is_active, userId]
        )

        if (result.affectedRows === 0) {
            throw new AppError("Không tìm thấy User!", 404);
        }
        res.status(200).json({ message: is_active ? "Đã MỞ KHÓA tài khoản!" : "Đã KHÓA tài khoản (Cấm đăng nhập)!" });
    });

    // API đặt lại mật khẩu (Reset Password)
    static resetPassword = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.params.id;
        
        // BẢO MẬT: Tạo mật khẩu ngẫu nhiên (8 ký tự) thay vì dùng 123456
        const tempPassword = crypto.randomBytes(4).toString('hex');      
        const hashedPassword = await PasswordUtil.hash(tempPassword);

        const [result]: any = await pool.query('UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        )
        if (result.affectedRows === 0) {
            throw new AppError("Không tìm thấy User!", 404);
        }
        // Trả mật khẩu tạm thời về cho Admin để Admin gửi cho User qua kênh nội bộ (Vì chưa cài Email)
        res.status(200).json({ 
            message: "Đã reset mật khẩu thành công!",
            newPassword: tempPassword
        });
    });
}
