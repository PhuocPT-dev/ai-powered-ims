import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { TrainingService } from "../service/trainingService";

export class TrainingController {
    static createProgram = asyncHandler(async (req: AuthRequest, res: Response) => {
        const coordinator_id = req.user?.id;
        if (!coordinator_id) throw new AppError("Không xác định được danh tính", 401);

        const { title, description, start_date, end_date } = req.body;

        const programId = await TrainingService.createProgram(title, description, start_date, end_date, coordinator_id);
        
        res.status(201).json({
            status: "success",
            message: "Đã tạo Khóa học thành công!",
            programId: programId
        });
    });

    static enrollIntern = asyncHandler(async (req: AuthRequest, res: Response) => {
        const trainingId = req.params.trainingId as string;
        const { intern_id } = req.body;
        
        const role = await TrainingService.getUserRole(intern_id);
        if (!role || role !== 'INTERN') {
            throw new AppError("Bảo vệ: Người này không phải là Thực tập sinh, không thể cho vào lớp!", 400);
        }

        const training = await TrainingService.getTrainingProgramInfo(trainingId);
        if (!training) {
            throw new AppError("Khóa học không tồn tại!", 404);
        }
        
        if (training.coordinator_id !== req.user?.id && req.user?.role !== 'ADMIN') {
            throw new AppError("Bạn không có quyền điểm danh Thực tập sinh vào Khóa học của người khác!", 403);
        }

        const isEnrolled = await TrainingService.isInternEnrolled(intern_id, trainingId);
        if (isEnrolled) {
            throw new AppError("Thực tập sinh này đã được điểm danh trước đó!", 400);
        }

        await TrainingService.enrollIntern(intern_id, trainingId);
        
        res.status(201).json({
            status: "success",
            message: "Đã thêm Thực tập sinh vào khóa học thành công!"
        });
    });
}
