import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { JobService } from "../service/jobService";

export class JobController {
    // Hàm xử lý Đang tin tuyển dụng mới 
    static createJob = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { title, description } = req.body;
        const employerId = req.user?.id

        //Quăng việc nặng nhọc (SQL) xuống (Service) làm
        const jobId = await JobService.createJob(req.body, employerId);

        // Trả về kết quả
        res.status(201).json({
            status: "success",
            message: "Tạo tin tuyển dụng thành công!",
            data: {
                job_id: jobId
            }
        })
    });
    // API lấy danh sách toàn bộ tin tuyển dụng (public)
    static getAllJobs = asyncHandler(async (req: Request, res: Response) => {
        const jobs = await JobService.getAllJobs();

        res.status(200).json({
            status: "success",
            message: "Lấy danh sách thành công",
            data: {
                total: jobs.length,
                jobs: jobs
            }
        })
    })
}