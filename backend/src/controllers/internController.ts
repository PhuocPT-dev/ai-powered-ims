import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import pool from '../config/db';
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

export class InternController {
    //API tạo mới hồ sơ thực tập sinh
    static createProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
        // BẢO MẬT: Lấy userId từ JWT (Chống giả mạo) và sửa lỗi chính tả university
        const user_id = req.user?.id;
        const { university, major, skills, emergency_contact } = req.body;

        //kiểm tra có phải là INTERN
        const [users]: any = await pool.query('SELECT role From users WHERE id = ?', [user_id]);

        if (users.length === 0) {
            throw new AppError("Không tìm thấy người dùng này!", 404);
        }
        if (users[0].role !== 'INTERN') {
            throw new AppError("Người này chưa được thăng cấp làm Thực tập sinh, không thể tạo hồ sơ bảo mật!", 400);
        }

        const [result]: any = await pool.query(
            `INSERT INTO intern_profiles(user_id, university, major, skills, emergency_contact)
            VALUES(? ,? ,? , ?, ?)`,
            [user_id, university, major, skills, emergency_contact]
        );
        res.status(201).json({
            status: "success",
            message: "Tạo hồ sơ Intern thành công!",
            profileId: result.insertId
        });
    });

    static getProfile = asyncHandler(async (req: Request, res: Response) => {
        // lấy id từ URL
        const userID = req.params.userId;

        // BẢO MẬT: Không dùng SELECT * để tránh lộ các cột nhạy cảm nếu sau này JOIN bảng
        const [profiles]: any = await pool.query(
            'SELECT id, user_id, university, major, skills, emergency_contact, created_at FROM intern_profiles WHERE user_id = ?', 
            [userID]
        );

        if (profiles.length === 0) {
            throw new AppError("Không tìm thấy thông tin hồ sơ này.", 404);
        }
        res.status(200).json({ status: "success", data: profiles[0] });
    });

    static updateProfile = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.params.userId;
        const { university, major, skills, emergency_contact } = req.body;
        // đè dữ liệu mới lên dl cũ
        const [result]: any = await pool.query(
            `UPDATE intern_profiles SET university = ?, major = ? , skills = ?, emergency_contact = ? 
            WHERE user_id = ?`,
            [university, major, skills, emergency_contact, userId]
        );

        if (result.affectedRows === 0) {
            throw new AppError("Không tìm thấy hồ sơ để cập nhật!", 404);
        }
        res.status(200).json({ status: "success", message: "Đã cập nhật hồ sơ thành công!" });
    });
}