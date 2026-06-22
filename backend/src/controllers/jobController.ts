import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { JobService } from "../service/jobService";

export class JobController {
    // Hàm xử lý Đang tin tuyển dụng mới 
    static createJob = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { title, description } = req.body;
        const employerId = req.user?.id;
        if (!employerId) throw new AppError("Không xác định được danh tính nhà tuyển dụng!", 401);

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
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await JobService.getAllJobs(page, limit);

        res.status(200).json({
            status: "success",
            message: "Lấy danh sách thành công",
            data: {
                total_records: result.total,
                current_page: result.page,
                total_pages: Math.ceil(result.total / result.limit),
                jobs: result.jobs
            }
        })
    });

    static deleteJob = asyncHandler(async (req: AuthRequest, res: Response) => {
        const jobId = parseInt(req.params.id as string);
        await JobService.deleteJob(jobId);
        res.status(200).json({ status: "success", message: "Xóa tin tuyển dụng thành công!" });
    });
}