import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import pool from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

export class FeedbackController {
    //API : intern gửi đánh giá
    static submitFeedback = asyncHandler(async (req: AuthRequest, res: Response) => {
        // BẢO MẬT: Lấy intern_id từ Thẻ Token (req.user), tuyệt đối không lấy từ req.body để chống giả mạo
        const intern_id = req.user?.id;
        const { mentor_id, rating, comment, is_anonymous } = req.body;
        if (rating < 1 || rating > 5) {
            throw new AppError("Ràng buộc dữ liệu: Chỉ được chấm từ 1 đến 5 sao!", 400);
        }

        await pool.query(
            `INSERT INTO feedbacks (intern_id, mentor_id, rating, comment, is_anonymous) 
             VALUES (?, ?, ?, ?, ?)`,
            [intern_id, mentor_id, rating, comment, is_anonymous || false]
        );

        res.status(201).json({ status: "success", message: "Cảm ơn bạn đã dũng cảm gửi đánh giá!" });
    });

    // API : xem danh sách feedback 
    static getMentorFeedbacks = asyncHandler(async (req: Request, res: Response) => {
        const mentorId = req.params.mentorId;

        const [feedbacks]: any = await pool.query(
            `SELECT f.id, f.rating, f.comment, f.is_anonymous, f.created_at, u.full_name as intern_name
            FROM feedbacks f
            JOIN users u ON f.intern_id = u.id
            WHERE f.mentor_id = ?
            ORDER BY f.created_at DESC`,
            [mentorId]
        )
        const secureFeedbacks = feedbacks.map((fb: any) => {
            if (fb.is_anonymous === 1) {
                fb.intern_name = "Thực tập sinh giấu tên 🕵️";
            }
            return fb;
        });
        res.json({ status: "success", data: secureFeedbacks });
    });
}