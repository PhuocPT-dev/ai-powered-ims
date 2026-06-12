import pool from "../config/db";
import { PDFService } from "../utils/pdf";
import { AIService } from "../utils/ai";
import { EmailService } from '../utils/email';
import { AppError } from "../utils/AppError";

export class ApplicationService {
    // lấy danh sách CV
    static async getApplicationsByJob(jobId: string) {
        const [rows] = await pool.query(`
            SELECT id, candidate_id, cv_url, ai_summary, status, created_at
            FROM applications
            WHERE job_id = ?
            ORDER BY created_at DESC`,
            [jobId]
        );
        return rows;
    }

    //đưa cho AI chấm, rồi lưu vào Database
    static async applyJob(jobId: string, candidateId: number, cv_url: string) {
        console.log(`Đang tải file PDF từ: ${cv_url}`);
        const cvText = await PDFService.extractTextFromUrl(cv_url);
        let aiSummary = "AI không thể đọc được CV này.";
        if (cvText && cvText.length > 20) {
            console.log("Đang nhờ AI phân tích CV...");
            aiSummary = await AIService.analyzeCV(cvText);
        }
        const [result]: any = await pool.query(
            'INSERT INTO applications (job_id, candidate_id, cv_url, ai_summary) VALUES (?,?,?,?)',
            [jobId, candidateId, cv_url, aiSummary]
        );
        return result;
    }

    //  cập nhật trạng thái 
    static async updateApplicationStatus(applicationId: string, status: string) {
        const validStatuses = ['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED'];
        if (!validStatuses.includes(status)) {
            throw new AppError("Trạng thái không hợp lệ!", 400);
        }
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const [applications]: any = await connection.query(
                'SELECT candidate_id FROM applications WHERE id = ? FOR UPDATE',
                [applicationId]
            );
            if (applications.length === 0) {
                throw new AppError("Không tìm thấy đơn xin việc này!", 404);
            }
            const candidateId = applications[0].candidate_id;
            await connection.query(
                'UPDATE applications SET status = ? WHERE id = ? ',
                [status, applicationId]
            );
            if (status === 'ACCEPTED') {
                await connection.query(
                    'UPDATE users SET role = "INTERN" WHERE id = ?',
                    [candidateId]
                );

                const [users]: any = await connection.query(
                    'SELECT email, full_name FROM users WHERE id = ?',
                    [candidateId]
                );
                if (users.length > 0) {
                    const { email, full_name } = users[0];
                    const subject = "🎉 CHÚC MỪNG TRÚNG TUYỂN THỰC TẬP SINH - IMS";
                    const text = `Chào ${full_name},\n\nChúc mừng bạn đã vượt qua vòng đánh giá CV khắt khe của AI và chính thức trở thành Thực tập sinh tại công ty.\n\nTài khoản hệ thống của bạn đã được thăng cấp. Vui lòng đăng nhập vào Web để xem các công việc được Mentor giao.\n\nTrân trọng,\nPhòng Nhân Sự.`;

                    await EmailService.sendMail(email, subject, text);
                }
            }
            await connection.commit(); // Dập mốc đóng dấu an toàn
            return { status, candidateId };
        } catch (error) {
            await connection.rollback(); // Nếu có lỗi, Thợ hồ tự biết dọn dẹp hiện trường
            throw error; // Quăng nguyên cục nợ lên cho thằng Lễ tân (Controller) xử lý
        } finally {
            connection.release(); // Trả đồ nghề
        }
    }
}