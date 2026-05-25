import { Request, Response } from "express";
import pool from "../config/db";

export class TrainingController {
    // API tạo khóa học
    static async createProgram(req: Request, res: Response): Promise<void> {
        try {
            const { title, description, start_date, end_date, coordinator_id } = req.body;

            const [result]: any = await pool.query(
                `INSERT INTO training_programs (title, description, start_date, end_date, coordinator_id)
                VALUES (?, ?, ?, ?, ?)`,
                [title, description, start_date, end_date, coordinator_id]
            )
            res.status(201).json({
                status: "success",
                message: "Đã tạo Khóa học thành công!",
                programId: result.insertId
            });

        } catch (error) {
            res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }
    //  API ĐIỂM DANH (GÁN INTERN VÀO KHÓA HỌC)
    static async enrollIntern(req: Request, res: Response): Promise<void> {
        try {
            const trainingId = req.params.trainingId //Lấy từ đường dẫn URL
            const { intern_id } = req.body;
            // Kiểm tra
            const [users]: any = await pool.query(
                'SELECT role FROM users WHERE id = ?',
                [intern_id]
            );

            if (users.length === 0 || users[0].role !== 'INTERN') {
                res.status(400).json({ message: "Bảo vệ: Người này không phải là Thực tập sinh, không thể cho vào lớp!" });
                return;

            }
            // Nếu đúng là Intern
            await pool.query(
                `INSERT INTO intern_trainings (intern_id, training_id)
                VALUES (?,?)`,
                [intern_id, trainingId]
            );
            res.status(201).json({
                status: "success",
                message: "Đã thêm Thực tập sinh vào khóa học thành công!"
            });
        } catch (error: any) {
            if (error.code === 'ER_DUP_ENTRY') {
                res.status(400).json({ message: "Thực tập sinh này đã được điểm danh trước đó!" });
            } else {
                res.status(500).json({ message: "Lỗi hệ thống" });
            }
        }
    }
}



