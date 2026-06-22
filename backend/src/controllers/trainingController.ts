import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import pool from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

export class TrainingController {
    // API tạo khóa học
    static createProgram = asyncHandler(async (req: AuthRequest, res: Response) => {
        // BẢO MẬT: Lấy coordinator_id từ Token (Chống giả mạo)
        const coordinator_id = req.user?.id;
        const { title, description, start_date, end_date } = req.body;


        const [result]: any = await pool.query(
            `INSERT INTO training_programs (title, description, start_date, end_date, coordinator_id)
            VALUES (?, ?, ?, ?, ?)`,
            [title, description, start_date, end_date, coordinator_id]
        );
        res.status(201).json({
            status: "success",
            message: "Đã tạo Khóa học thành công!",
            programId: result.insertId
        });
    });

    //  API ĐIỂM DANH (GÁN INTERN VÀO KHÓA HỌC)
    static enrollIntern = asyncHandler(async (req: AuthRequest, res: Response) => {
        const trainingId = req.params.trainingId //Lấy từ đường dẫn URL
        const { intern_id } = req.body;
        
        // Kiểm tra xem đối tượng có đúng là INTERN không
        const [users]: any = await pool.query(
            'SELECT role FROM users WHERE id = ?',
            [intern_id]
        );

        if (users.length === 0 || users[0].role !== 'INTERN') {
            throw new AppError("Bảo vệ: Người này không phải là Thực tập sinh, không thể cho vào lớp!", 400);
        }

        // BẢO MẬT 1: Kiểm tra xem khóa học có tồn tại không
        // BẢO MẬT 2: Phân quyền cấp tài nguyên (Chỉ người tạo khóa học mới được phép thêm người)
        const [trainings]: any = await pool.query(
            'SELECT id, coordinator_id FROM training_programs WHERE id = ?', 
            [trainingId]
        );
        
        if (trainings.length === 0) {
            throw new AppError("Khóa học không tồn tại!", 404);
        }

        const training = trainings[0];
        
        // Admin thì được phép làm mọi thứ, nhưng nếu là MENTOR/COORDINATOR thì phải chính chủ
        if (training.coordinator_id !== req.user?.id && req.user?.role !== 'ADMIN') {
            throw new AppError("Bạn không có quyền điểm danh Thực tập sinh vào Khóa học của người khác!", 403);
        }

        // Kiểm tra xem intern đã được điểm danh vào khóa học này chưa
        const [existing]: any = await pool.query(
            'SELECT id FROM intern_trainings WHERE intern_id = ? AND training_id = ?',
            [intern_id, trainingId]
        );
        if (existing.length > 0) {
            throw new AppError("Thực tập sinh này đã được điểm danh trước đó!", 400);
        }

        await pool.query(
            `INSERT INTO intern_trainings (intern_id, training_id) VALUES (?, ?)`,
            [intern_id, trainingId]
        );
        res.status(201).json({
            status: "success",
            message: "Đã thêm Thực tập sinh vào khóa học thành công!"
        });
    });
}
