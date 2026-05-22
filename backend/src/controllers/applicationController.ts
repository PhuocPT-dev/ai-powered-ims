import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import pool from "../config/db";
import { PDFService } from "../utils/pdf";
import { AIService } from "../utils/ai";


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