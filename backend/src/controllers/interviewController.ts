import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { EmailService } from "../utils/email";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { InterviewService } from "../service/interviewService";

export class InterviewController {
    static getAllInterviews = asyncHandler(async (req: Request, res: Response) => {
        const interviews = await InterviewService.getAllInterviews();
        res.status(200).json({ status: "success", data: interviews });
    });

    static scheduleInterview = asyncHandler(async (req: AuthRequest, res: Response) => {
        const coordinator_id = req.user?.id;
        if (!coordinator_id) {
            throw new AppError("Không xác định được điều phối viên!", 401);
        }

        const { application_id, interview_time, meeting_link } = req.body;

        const appInfo = await InterviewService.getApplicationInfo(application_id);

        if (!appInfo) {
            throw new AppError("Không tìm thấy đơn ứng tuyển!", 404);
        }

        await InterviewService.scheduleInterview(application_id, coordinator_id, interview_time, meeting_link);

        const subject = "📅 THÔNG BÁO LỊCH PHỎNG VẤN - IMS";
        const text = `Chào ${appInfo.full_name},\n\nBạn có một lịch phỏng vấn cho vị trí ${appInfo.title}.
        \n- Thời gian: ${interview_time}\n- Link tham gia: ${meeting_link}
        \n\nVui lòng chuẩn bị kỹ và tham gia đúng giờ!\n\nTrân trọng,\nBộ phận Điều phối.`;

        await EmailService.sendMail(appInfo.email, subject, text);

        res.status(201).json({ status: "success", message: "Đã lên lịch và báo Email thành công!" });
    });

    static getMyInterviews = asyncHandler(async (req: AuthRequest, res: Response) => {
        const candidateId = req.user?.id;
        if (!candidateId) throw new AppError("Không xác định được danh tính", 401);

        const interviews = await InterviewService.getMyInterviews(candidateId);
        res.status(200).json({ status: "success", data: interviews });
    });

    static updateStatus = asyncHandler(async (req: Request, res: Response) => {
        const interviewId = req.params.id as string;
        const { status } = req.body;
        
        const updated = await InterviewService.updateStatus(interviewId, status);
        if (!updated) throw new AppError("Không tìm thấy lịch phỏng vấn", 404);

        res.status(200).json({ status: "success", message: `Đã cập nhật trạng thái phỏng vấn thành ${status}` });
    });
}
