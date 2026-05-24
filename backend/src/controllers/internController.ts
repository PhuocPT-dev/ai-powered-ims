import { Request, Response } from "express";
import pool from '../config/db';

export class InternController {
    //API tạo mới hồ sơ thực tập sinh
    static async createProfile(req: Request, res: Response): Promise<void> {
        try {
            const { user_id, unviversity, major, skills, emergency_contact } = req.body;

            //kiểm tra có phải là INTERN
            const [users]: any = await pool.query('SELECT role From users WHERE id = ?', [user_id]);

            if (users.length === 0) {
                res.status(404).json({ message: "Không tìm thấy người dùng này!" });
                return;
            }
            if (users[0].role !== 'INTERN') {
                res.status(400).json({ message: "Người này chưa được thăng cấp làm Thực tập sinh, không thể tạo hồ sơ bảo mật!" });
                return;
            }

            const [result]: any = await pool.query(
                `INSERT INTO intern_profiles(user_id, university, major, skills, emergency_contact)
                VALUES(? ,? ,? , ?, ?)`,
                [user_id, unviversity, major, skills, emergency_contact]
            )
            res.status(201).json({
                status: "success",
                message: "Tạo hồ sơ Intern thành công!",
                profileId: result.insertId
            });
        } catch (error) {
            console.error("Lỗi khi tạo hồ sơ Intern:", error);
            res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }
    static async getProfile(req: Request, res: Response): Promise<void> {
        try {
            // lấy id từ URL
            const userID = req.params.userId;

            const [profiles]: any = await pool.query('SELECT * FROM intern_profiles WHERE user_id = ?', [userID]);

            if (profiles.length === 0) {
                res.status(404).json({ message: "Không tìm thấy thông tin hồ sơ này." })
                return;
            }
            res.status(200).json({ status: "success", data: profiles[0] });
        } catch (error) {
            res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }

    static async updateProfile(reqq: Request, res: Response): Promise<void> {
        try {
            const userId = reqq.params.userId;
            const { university, major, skills, emergency_contact } = reqq.body;
            // đè dữ liệu mới lên dl cũ
            const [result]: any = await pool.query(
                `UPDATE intern_profiles SET university = ?, major = ? , skills = ?, emergency_contact = ? 
                WHERE user_id = ?`,
                [university, major, skills, emergency_contact, userId]
            );

            if (result.affectedRows === 0) {
                res.status(404).json({ message: "Không tìm thấy hồ sơ để cập nhật!" });
                return;
            }
            res.status(200).json({ status: "success", message: "Đã cập nhật hồ sơ thành công!" });

        } catch (error) {
            console.error("Lỗi khi cập nhật hồ sơ:", error);
            res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }
}