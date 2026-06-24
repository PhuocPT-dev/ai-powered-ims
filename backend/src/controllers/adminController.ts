import { Request, Response } from "express"
import { PasswordUtil } from '../utils/password';
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import crypto from 'crypto';
import { AdminService } from "../service/adminService";

export class AdminController {
    static toggleUserStatus = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.params.id as string;
        const { is_active } = req.body;

        const updated = await AdminService.toggleUserStatus(userId, is_active);

        if (!updated) {
            throw new AppError("Không tìm thấy User!", 404);
        }
        res.status(200).json({ message: is_active ? "Đã MỞ KHÓA tài khoản!" : "Đã KHÓA tài khoản (Cấm đăng nhập)!" });
    });

    static resetPassword = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.params.id as string;
        
        const tempPassword = crypto.randomBytes(4).toString('hex');      
        const hashedPassword = await PasswordUtil.hash(tempPassword);

        const updated = await AdminService.updatePassword(userId, hashedPassword);
        if (!updated) {
            throw new AppError("Không tìm thấy User!", 404);
        }
        
        res.status(200).json({ 
            message: "Đã reset mật khẩu thành công!",
            newPassword: tempPassword
        });
    });
}
