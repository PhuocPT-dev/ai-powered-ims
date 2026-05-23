import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import pool from "../config/db";
import { PDFService } from "../utils/pdf";
import { AIService } from "../utils/ai";
import { EmailService } from '../utils/email';



export class ApplicationController {

    //API nộp CV ứng tuyển (CÓ TÍCH HỢP AI)
    static async applyJob(req: AuthRequest, res: Response): Promise<void> {
        try {
            //lấy mã job từ trên thanh URL
            const jobId = req.params.id;
            const { cv_url } = req.body;

            if (!cv_url) {
                res.status(400).json({ message: "Vui lòng đính kèm link CV của bạn!" });
                return;
            }

            const candidateId = req.user?.id;

            // --- BẮT ĐẦU QUY TRÌNH CHẤM CV BẰNG AI ---
            console.log(`Đang tải file PDF từ: ${cv_url}`);

            // 1. Tải và đọc chữ từ file PDF
            const cvText = await PDFService.extractTextFromUrl(cv_url);

            let aiSummary = "AI không thể đọc được CV này.";

            // Nếu vắt được chữ, nhờ AI chấm điểm
            if (cvText && cvText.length > 20) {
                console.log("Đang nhờ AI phân tích CV...");
                aiSummary = await AIService.analyzeCV(cvText);
            }
            // --- KẾT THÚC QUY TRÌNH AI ---

            // 4. Lưu Đơn xin việc cùng với Lời nhận xét của AI vào Database
            // Cột ai_score tạm thời để null, ta lưu lời nhận xét vào ai_summary
            await pool.query(
                'INSERT INTO applications (job_id, candidate_id, cv_url, ai_summary) VALUES (?,?,?,?)',
                [jobId, candidateId, cv_url, aiSummary]
            )

            res.status(201).json({
                status: "success",
                message: "Nộp CV thành công! Giám đốc AI đã ghi nhận hồ sơ của bạn."
            })
        } catch (error) {
            console.error("Lỗi khi nộp CV:", error);
            res.status(500).json({ message: "Lỗi hệ thống" })
        }
    }
    // API cập nhật trạng thái đơn xin việc 
    static async updateStatus(req: AuthRequest, res: Response): Promise<void> {
        // Sử dụng Transaction để đảm bảo an toàn dữ liệu
        const connection = await pool.getConnection();
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

            // Bắt đầu Transaction
            await connection.beginTransaction();

            // Tìm xem đơn này của ai nộp
            const [applications]: any = await connection.query(
                'SELECT candidate_id FROM applications WHERE id = ? FOR UPDATE', // FOR UPDATE nhằm chống trường hợp 2 người cùng sửa
                [applicationId]
            )

            if (applications.length === 0) {
                // Đang làm dở mà có lỗi -> Phải ROLLBACK (Quay xe/Hủy bỏ) trước khi chửi
                await connection.rollback();
                res.status(404).json({ message: "Không tìm thấy đơn xin việc này!" })
                return;
            }

            const candidateId = applications[0].candidate_id;

            // cập nhập lại trạng thái đơn trang bảng applications
            await connection.query(
                'UPDATE applications SET status = ? WHERE id = ? ',
                [status, applicationId]
            )

            // Thông báo cho người nộp (nếu là ACCEPTED)
            if (status === 'ACCEPTED') {
                await connection.query(
                    'UPDATE users SET role = "INTERN" WHERE id = ?',
                    [candidateId]
                )
                // lấy thông tin mail của ứng viên
                const [users]: any = await connection.query(
                    'SELECT email, full_name FROM users WHERE id = ?',
                    [candidateId]
                )

                if (users.length > 0) {
                    const candidateEmail = users[0].email;
                    const candidateName = users[0].full_name;
                    // Nhờ "Người đưa thư" giao hàng
                    const subject = "🎉 CHÚC MỪNG TRÚNG TUYỂN THỰC TẬP SINH - IMS";
                    const text = `Chào ${candidateName},\n\nChúc mừng bạn đã vượt qua vòng đánh giá CV khắt khe của AI và chính thức trở thành Thực tập sinh tại công ty.
                    \n\nTài khoản hệ thống của bạn đã được thăng cấp. 
                    Vui lòng đăng nhập vào Web để xem các công việc được Mentor giao.
                    \n\nTrân trọng,
                    \nPhòng Nhân Sự.`;

                    await EmailService.sendMail(candidateEmail, subject, text);
                }
            }

            // MỌI THỨ TRƠN TRU -> Dập mốc, xác nhận lưu vĩnh viễn vào Database
            await connection.commit();

            // Báo thành công
            res.status(200).json({
                status: "success",
                message: `Đã cập nhật đơn số ${applicationId} thành ${status}. ${status === 'ACCEPTED' ? 'Ứng viên đã chính thức trở thành Thực tập sinh!' : ''}`
            });
        } catch (error) {
            // NẾU CÓ BẤT KỲ LỖI NÀO (Rớt mạng, sập nguồn, lỗi code) -> Hủy bỏ toàn bộ thao tác, trả DB về như cũ
            await connection.rollback();
            console.error("Lỗi khi cập nhật trạng thái đơn:", error);
            res.status(500).json({ message: "Lỗi hệ thống" });
        } finally {
            // Dù thành công hay thất bại, bắt buộc phải trả lại đường truyền cho pool
            connection.release();
        }
    }
    //APi Lấy danh sách CV nộp vào một Job (dành cho HR xem)
    static async getApplication(req: AuthRequest, res: Response): Promise<void> {
        try {
            // lấy ID của Job từ trên URL
            const jobId = req.params.id;
            // Truy vấn vào DB để lấy toàn bộ đơn ứng tuyển
            const [rows] = await pool.query(`
                SELECT id, candidate_id, cv_url, ai_summary, status, created_at
                FROM applications
                WHERE job_id =?
                ORDER BY created_at DESC`,
                [jobId]
            );
            res.status(200).json({
                status: "success",
                data: rows
            })
        } catch (error) {
            console.error("Lỗi khi lấy danh sách CV:", error);
            res.status(500).json({ message: "Lỗi hệ thống" });
        }
    }
}