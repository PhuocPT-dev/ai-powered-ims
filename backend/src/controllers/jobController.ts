import pool from "../config/db";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Request, Response } from "express";

export class JobController {
    // Hàm xử lý Đang tin tuyển dụng mới 
    static async createJob(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { title, description, salary, location } = req.body;

            if (!title || !description) {
                res.status(400).json({ message: "Vui lòng nhập đủ tên và mô tả công việc" });
                return;
            }

            // req.user.id là id của admin do middleware đã xác thực trước đó cấp
            const employerId = req.user?.id;

            const [result]: any = await pool.query(
                `INSERT INTO jobs (title, description, salary, location, employer_id) VALUES (?,?,?,?,?)`,
                [title, description, salary, location, employerId]
            )

            // Trả về kết quả
            res.status(201).json({
                status: "success",
                message: "Tạo tin tuyển dụng thành công!",
                data: {
                    job_id: result.insertId,
                }
            })
        } catch (error) {
            console.error("Lỗi khi Đăng Job:", error);
            res.status(500).json({ message: "Lỗi hệ thống!" });
        }
    }
    // API lấy danh sách toàn bộ tin tuyển dụng (public)
    static async getAllJobs(req: Request, res: Response): Promise<void> {
        try {
            // Lệnh SQL lấy tất cả các jobs, bài mới đăng sẽ xếp lên đầu (nhờ ORDER BY ... DESC)
            const [jobs]: any = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC');

            res.status(200).json({
                status: "success",
                message: "Lấy danh sách thành công",
                data: {
                    total: jobs.length, // Tiện tay đếm luôn tổng số bài báo cho Frontend
                    jobs: jobs // Trả toàn bộ dữ liệu bài viết
                }
            })

        } catch (error) {
            console.error("Lỗi khi Lấy danh sách Job:", error);
            res.status(500).json({ message: "Lỗi hệ thống!" });
        }
    }
}