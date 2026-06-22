import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import pool from "../config/db";
import { EmailService } from "../utils/email";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

export class InterviewController {
    static scheduleInterview = asyncHandler(async (req: AuthRequest, res: Response) => {
        // Lấy coordinator_id từ token JWT để chống giả mạo
        const coordinator_id = req.user?.id;
        if (!coordinator_id) {
            throw new AppError("Không xác định được điều phối viên!", 401);
        }

        // Các thông tin khác vẫn lấy từ body
        const { application_id, interview_time, meeting_link } = req.body;

        // BƯỚC 1: Tra cứu thông tin ứng viên (Kiểm tra xem đơn ứng tuyển có tồn tại không)
        const [applications]: any = await pool.query(
            `SELECT u.email, u.full_name, j.title FROM applications a
            JOIN users u ON a.candidate_id = u.id
            JOIN jobs j ON  a.job_id = j.id
            WHERE a.id= ?
            `,
            [application_id]
        );

        if (applications.length === 0) {
            throw new AppError("Không tìm thấy đơn ứng tuyển!", 404);
        }

        // BƯỚC 2: Lưu lịch hẹn vào database (Chỉ thực hiện khi đơn ứng tuyển đã hợp lệ)
        await pool.query(
            `
            INSERT INTO interviews (application_id, coordinator_id, interview_time, meeting_link) 
            VALUES (?, ?, ?, ?)`,
            [application_id, coordinator_id, interview_time, meeting_link]
        );

        const appInfo = applications[0];
        const subject = "📅 THÔNG BÁO LỊCH PHỎNG VẤN - IMS";
        const text = `Chào ${appInfo.full_name},\n\nBạn có một lịch phỏng vấn cho vị trí ${appInfo.title}.
        \n- Thời gian: ${interview_time}\n- Link tham gia: ${meeting_link}
        \n\nVui lòng chuẩn bị kỹ và tham gia đúng giờ!\n\nTrân trọng,\nBộ phận Điều phối.`;

        // gửi email thông báo
        await EmailService.sendMail(appInfo.email, subject, text)

        res.status(201).json({ status: "success", message: "Đã lên lịch và báo Email thành công!" });
    });
}
