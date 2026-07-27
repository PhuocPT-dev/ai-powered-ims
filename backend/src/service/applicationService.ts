import pool from "../config/db";
import { ResultSetHeader } from "mysql2/promise";
import { PDFService } from "../utils/pdf";
import { AIService } from "../utils/ai";
import { EmailService } from '../utils/email';
import { AppError } from "../utils/AppError";
import { ApplicationRow, UserRow } from "../types/database";

export class ApplicationService {
    // lấy danh sách CV
    static async getApplicationsByJob(jobId: string) {
        const [rows] = await pool.query<ApplicationRow[]>(`
            SELECT id, candidate_id, cv_url, ai_summary, ai_score, status, created_at
            FROM applications
            WHERE job_id = ?
            ORDER BY created_at DESC`,
            [jobId]
        );
        return rows;
    }

    static async getPendingApplications() {
        const [rows] = await pool.query<ApplicationRow[]>(`
            SELECT a.id, a.status, u.full_name as candidate_name, j.title as job_title
            FROM applications a
            JOIN users u ON a.candidate_id = u.id
            JOIN jobs j ON a.job_id = j.id
            WHERE a.status IN ('PENDING', 'REVIEWING')
            ORDER BY a.created_at DESC
        `);
        return rows;
    }

    //đưa cho AI chấm, rồi lưu vào Database
    static async applyJob(jobId: string, candidateId: number, cv_url: string) {
        const cvText = await PDFService.extractTextFromUrl(cv_url);
        let aiSummary = "AI không thể đọc được CV này.";
        let aiScore = null;

        if (cvText && cvText.length > 20) {
            const aiResult = await AIService.analyzeCV(cvText);
            aiSummary = aiResult.summary;
            aiScore = aiResult.score;
        }
        
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO applications (job_id, candidate_id, cv_url, ai_summary, ai_score) VALUES (?,?,?,?,?)',
            [jobId, candidateId, cv_url, aiSummary, aiScore]
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
            const [applications] = await connection.query<ApplicationRow[]>(
                'SELECT candidate_id FROM applications WHERE id = ? FOR UPDATE',
                [applicationId]
            );
            if (applications.length === 0) {
                throw new AppError("Không tìm thấy đơn xin việc này!", 404);
            }
            const candidateId = applications[0].candidate_id;
            await connection.query<ResultSetHeader>(
                'UPDATE applications SET status = ? WHERE id = ? ',
                [status, applicationId]
            );
            if (status === 'ACCEPTED') {
                await connection.query<ResultSetHeader>(
                    'UPDATE users SET role = "INTERN" WHERE id = ?',
                    [candidateId]
                );

                const [users] = await connection.query<UserRow[]>(
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