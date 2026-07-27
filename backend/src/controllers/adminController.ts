import { Request, Response } from "express"
import { PasswordUtil } from '../utils/password';
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import crypto from 'crypto';
import { AdminService } from "../service/adminService";
import { EmailService } from "../utils/email";

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

        const user = await AdminService.getUserById(userId);
        if (!user) throw new AppError("Không tìm thấy User!", 404);

        const tempPassword = crypto.randomBytes(4).toString('hex');
        const hashedPassword = await PasswordUtil.hash(tempPassword);

        await AdminService.updatePassword(userId, hashedPassword);

        // Gửi email
        const subject = "🔐 Đặt lại Mật khẩu - IMS";
        const text = `Chào ${user.full_name},\n\nMật khẩu của bạn đã được Admin đặt lại.\nMật khẩu mới của bạn là: ${tempPassword}\n\nVui lòng đăng nhập và đổi mật khẩu ngay lập tức!`;
        await EmailService.sendMail(user.email, subject, text);

        res.status(200).json({
            status: "success",
            message: "Đã reset và gửi mật khẩu mới qua Email thành công!"
        });
    });

    static getAllUsers = asyncHandler(async (req: Request, res: Response) => {
        const users = await AdminService.getAllUsers();
        res.status(200).json({ status: "success", data: users });
    });

    static createUser = asyncHandler(async (req: Request, res: Response) => {
        const { full_name, email, role } = req.body;

        const tempPassword = crypto.randomBytes(4).toString('hex');
        const hashedPassword = await PasswordUtil.hash(tempPassword);

        // 1. Tạo user trong DB và lấy ra ID vừa tạo
        const userId = await AdminService.createUser(full_name, email, role, hashedPassword);

        try {
            // 2. Thử gửi email
            const subject = "🎉 Chào mừng bạn gia nhập hệ thống IMS";
            const text = `Chào ${full_name},\n\nTài khoản của bạn đã được khởi tạo với vai trò ${role}.\nEmail đăng nhập: ${email}\nMật khẩu tạm thời: ${tempPassword}\n\nVui lòng đăng nhập và đổi mật khẩu sớm nhất có thể!`;
            await EmailService.sendMail(email, subject, text);
        } catch (emailError: any) {
            // 3. Nếu gửi email thất bại, Rollback (xóa user vừa tạo) để Admin có thể thử lại
            await AdminService.deleteUser(userId);
            console.error("Lỗi gửi email mật khẩu tạm thời:", emailError.message || emailError);
            throw new AppError("Đã tạo tài khoản thất bại do lỗi không thể gửi email mật khẩu tạm thời. Vui lòng thử lại!", 500);
        }

        res.status(201).json({
            status: "success",
            message: "Tạo tài khoản và gửi email thành công!",
            data: { email, role }
        });
    });


    static updateRole = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.params.id as string;
        const { role } = req.body;

        const updated = await AdminService.updateUserRole(userId, role);
        if (!updated) throw new AppError("Không tìm thấy User!", 404);

        res.status(200).json({ status: "success", message: `Đã đổi Role thành ${role}` });
    });
}
