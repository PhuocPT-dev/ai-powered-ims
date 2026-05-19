import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import pool from "../config/db";


export class ApplicationController {

    //API nộp CV ứng tuyển
    static async applyJob(req: AuthRequest, res: Response): Promise<void> {
        try {
            //lấy mã job từ trên thanh URL (ví dụ URL là /api/jobs/1/apply thì id = 1)
            const jobId = req.params.id;

            // Bóc tách và Kiểm tra Dữ liệu Form
            const { cv_url } = req.body;

            if (!cv_url) {
                res.status(400).json({ message: "Vui lòng đính kèm link CV của bạn!" });
                return;
            }

            // Lấy thẻ ID của ứng viên từ trong thẻ token
            const candidateId = req.user?.id;

            // 4. Lưu Đơn xin việc vào Database (Bảng applications)
            await pool.query(
                'INSERT INTO applications (job_id, candidate_id, cv_url) VALUES (?,?,?)',
                [jobId, candidateId, cv_url]
            )
            // 
            res.status(201).json({
                status: "success",
                message: "Nộp CV thành công!, Chúc bạn may mắn!"
            })
        } catch (error) {
            console.error("Lỗi khi nộp CV:", error);
            res.status(500).json({ message: "Lỗi hệ thống" })
        }
    }
    // API cập nhật trạng thái đơn xin việc 
    static async updateStatus(req: AuthRequest, res: Response): Promise<void> {
        try {
            // Lấy ID của đơn xin việc từ URL
            const applicationId = req.params.id;
            //Lấy trạng thái từ form
            const { status } = req.body;

            //chống nhập bậy bạ: chỉ cho phép 4 trạng thái
            const validStatuses = ['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED'];

            if (!validStatuses.includes(status)) {
                res.status(400).json({ message: "Trạng thái không hợp lệ! Chỉ nhận: PENDING, REVIEWING, ACCEPTED, REJECTED" });
                return;
            }

            // cập nhập lại DB
            await pool.query(
                'UPDATE applications SET status = ? WHERE id = ? ',
                [status, applicationId]
            )

            // Báo thành công
            res.status(200).json({
                status: "success",
                message: `Đã cập hật trạng thái đơn số ${applicationId} thành ${status}!`
            })
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái đơn:", error);
            res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }
}