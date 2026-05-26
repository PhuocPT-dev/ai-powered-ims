import { Request, Response } from "express";
import pool from "../config/db";

export class FeedbackController {
    //API : intern gửi đánh giá
    static async submitFeedback(req: Request, res: Response): Promise<void> {
        try {
            const { intern_id, mentor_id, rating, comment, is_anonymous } = req.body;
            if (rating < 1 || rating > 5) {
                res.status(400).json({ message: "Ràng buộc dữ liệu: Chỉ được chấm từ 1 đến 5 sao!" });
                return;
            }

            await pool.query(
                `INSERT INTO feedbacks (intern_id, mentor_id, rating, comment, is_anonymous) 
                 VALUES (?, ?, ?, ?, ?)`,
                [intern_id, mentor_id, rating, comment, is_anonymous || false]
            );

            res.status(201).json({ status: "success", message: "Cảm ơn bạn đã dũng cảm gửi đánh giá!" });
        } catch (error) {
            console.error("Lỗi gửi feedback:", error);
            res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }
    // API : xem danh sách feedback 
    static async getMentorFeedbacks(req: Request, res: Response): Promise<void> {
        try {
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
        } catch (error) {
            console.error("Lỗi xem feedback:", error);
            res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }
}