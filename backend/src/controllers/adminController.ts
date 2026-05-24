import { Request, Response } from "express"
import pool from "../config/db";
import bcrypt from 'bcrypt';

export class AdminController {
    static async toggleUserStatus(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.id;
            const { is_active } = req.body // Bắt giá trị: true = Mở, false = Khóa

            const [result]: any = await pool.query('UPDATE users SET is_active = ? WHERE id = ?',
                [is_active, userId]
            )

            if (result.affectedRows === 0) {
                res.status(404).json({ message: "Không tìm thấy User!" });
                return;
            }
            res.status(200).json({ message: is_active ? "Đã MỞ KHÓA tài khoản!" : "Đã KHÓA tài khoản (Cấm đăng nhập)!" });
        } catch (error) {
            console.error("Lỗi khi khóa/mở tài khoản:", error);
            res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }
    // API đặt lại mật khẩu
    static async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.id;
            const defaultPassword = "123456" // mk mặc định        
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);

            const [result]: any = await pool.query('UPDATE users SET password = ? WHERE id = ?',
                [hashedPassword, userId]
            )
            if (result.affectedRows === 0) {
                res.status(404).json({ message: "Không tìm thấy User!" });
                return;
            }
            res.status(200).json({ message: "Đã reset mật khẩu về mặc định: 123456" });
        } catch (error) {
            res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }
}
