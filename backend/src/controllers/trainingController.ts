import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { TrainingService } from "../service/trainingService";
import { AuthService } from "../service/authService";

export class TrainingController {
    static getAllPrograms = asyncHandler(async (req: Request, res: Response) => {
        const programs = await TrainingService.getAllPrograms();
        res.status(200).json({ status: "success", data: programs });
    });

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
        
        const user = await AuthService.getUserById(intern_id);
        if (!user || user.role !== 'INTERN') {
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

    static getProgramById = asyncHandler(async (req: Request, res: Response) => {
        const programId = req.params.id as string;
        const program = await TrainingService.getProgramById(programId);
        if (!program) throw new AppError("Không tìm thấy khóa học", 404);
        res.status(200).json({ status: "success", data: program });
    });

    static getProgramMembers = asyncHandler(async (req: Request, res: Response) => {
        const programId = req.params.id as string;
        const members = await TrainingService.getProgramMembers(programId);
        res.status(200).json({ status: "success", data: members });
    });

    static updateInternStatus = asyncHandler(async (req: Request, res: Response) => {
        const internTrainingId = req.params.id as string;
        const { status } = req.body;
        const updated = await TrainingService.updateInternStatus(internTrainingId, status);
        if (!updated) throw new AppError("Không tìm thấy bản ghi điểm danh!", 404);
        res.status(200).json({ status: "success", message: `Đã cập nhật tiến độ thành ${status}` });
    });

    static deleteProgram = asyncHandler(async (req: Request, res: Response) => {
        const programId = req.params.id as string;
        const deleted = await TrainingService.deleteProgram(programId);
        if (!deleted) throw new AppError("Không tìm thấy khóa học", 404);
        res.status(200).json({ status: "success", message: "Đã xóa khóa học" });
    });

    static getMyTrainings = asyncHandler(async (req: AuthRequest, res: Response) => {
        const internId = req.user?.id;
        if (!internId) throw new AppError("Không xác định được danh tính", 401);

        const programs = await TrainingService.getInternTrainings(internId);
        res.status(200).json({ status: "success", data: programs });
    });
}
