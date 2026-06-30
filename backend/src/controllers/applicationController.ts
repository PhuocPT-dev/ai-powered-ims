import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { ApplicationService } from "../service/applicationService";



export class ApplicationController {

    //API nộp CV ứng tuyển (CÓ TÍCH HỢP AI)
    static applyJob = asyncHandler(async (req: AuthRequest, res: Response) => {
        const jobId = req.params.id as string;
        const { cv_url } = req.body;
        const candidateId = req.user?.id;
        if (!cv_url) {
            throw new AppError("Vui lòng đính kèm link CV của bạn!", 400);
        }
        if (!candidateId) {
            throw new AppError("Không tìm thấy thông tin Ứng viên", 401);
        }
        await ApplicationService.applyJob(jobId, candidateId, cv_url);

        res.status(201).json({
            status: "success",
            message: "Nộp CV thành công! Giám đốc AI đã ghi nhận hồ sơ của bạn."
        });
    })

    static updateStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
        const applicationId = req.params.id as string;
        const { status } = req.body;
        const result = await ApplicationService.updateApplicationStatus(applicationId, status);
        res.status(200).json({
            status: "success",
            message: `Đã cập nhật đơn thành ${result.status}. ${result.status === 'ACCEPTED' ? 'Ứng viên đã thăng cấp thành Thực tập sinh!' : ''}`
        });
    });

    static getApplication = asyncHandler(async (req: AuthRequest, res: Response) => {
        const jobId = req.params.id as string;
        const applications = await ApplicationService.getApplicationsByJob(jobId);
        res.status(200).json({
            status: "success",
            data: applications
        });
    });

    static getPendingApplications = asyncHandler(async (req: AuthRequest, res: Response) => {
        const pendingApps = await ApplicationService.getPendingApplications();
        res.status(200).json({
            status: "success",
            data: pendingApps
        });
    });
}