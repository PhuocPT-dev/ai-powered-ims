import { Request, Response } from "express";
import pool from "../config/db";
import { EmailService } from "../utils/email";

export class InterviewController {
    static async scheduleInterview(req: Request, res: Response): Promise<void> {
        // API lên lịch phỏng vấn
        try {
            const { application_id, coordinator_id, interview_time, meeting_link } = req.body;

            // Lưu lịch hẹn vào database
            await pool.query(
                `
                INSERT INTO interviews (application_id, coordinator_id, interview_time, meeting_link) 
                VALUES (?, ?, ?, ?)`,
                [application_id, coordinator_id, interview_time, meeting_link]
            );

            // Tra cứu thông tin ứng viên
            const [applications]: any = await pool.query(
                `SELECT u.email, u.full_name, j.title FROM applications a
                JOIN users u ON a.candidate_id = u.id
                JOIN jobs j ON  a.job_id = j.id
                WHERE a.id= ?
                `,
                [application_id]

            );

            if (applications.length > 0) {
                const appInfo = applications[0];
                const subject = "📅 THÔNG BÁO LỊCH PHỎNG VẤN - IMS";
                const text = `Chào ${appInfo.full_name},\n\nBạn có một lịch phỏng vấn cho vị trí ${appInfo.title}.
                \n- Thời gian: ${interview_time}\n- Link tham gia: ${meeting_link}
                \n\nVui lòng chuẩn bị kỹ và tham gia đúng giờ!\n\nTrân trọng,\nBộ phận Điều phối.`;

                // gửi email thông báo
                await EmailService.sendMail(appInfo.email, subject, text)

                res.status(201).json({ status: "success", message: "Đã lên lịch và báo Email thành công!" });
            }

        } catch (error) {
            console.error("Lỗi xếp lịch:", error);
            res.status(500).json({ message: "Lỗi hệ thống" });
        }

    }



}


