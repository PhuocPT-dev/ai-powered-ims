import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { TaskService } from "../service/taskService";

export class TaskController {

    // 1. MENTOR GIAO TASK CHO INTERN
    static createTask = asyncHandler(async (req: AuthRequest, res: Response) => {
        // 🛡️ BẢO MẬT: Lấy ID của Mentor từ chính Token đăng nhập (Tuyệt đối không tin req.body)
        const mentorId = req.user?.id;
        const { title, description, intern_id, deadline } = req.body;

        if (!mentorId) throw new AppError("Không tìm thấy thẻ định danh Mentor!", 401);
        if (!intern_id || !title) throw new AppError("Thiếu thông tin bắt buộc!", 400);


        const taskId = await TaskService.createTask(mentorId, intern_id, title, description, deadline);

        res.status(201).json({
            status: "success",
            message: "Đã giao Task thành công!",
            taskId: taskId
        });
    });

    // 2. INTERN XEM BẢNG CÔNG VIỆC CỦA MÌNH
    static getMyTasks = asyncHandler(async (req: AuthRequest, res: Response) => {
        const internId = req.user?.id; // Lấy từ Token của người đang đăng nhập
        if (!internId) throw new AppError("Không xác định được danh tính Intern!", 401);

        const tasks = await TaskService.getTasksByIntern(internId);

        res.status(200).json({
            status: "success",
            data: tasks
        });
    });

    // 3. INTERN BÁO CÁO TIẾN ĐỘ (Kéo thả thẻ Task)
    static updateTaskStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
        const internId = req.user?.id;
        const taskId = req.params.id as string; // Lấy ID của Task trên thanh URL (Ví dụ: /api/tasks/5/status)
        const { status } = req.body;

        if (!internId) throw new AppError("Không xác định được danh tính!", 401);

        await TaskService.updateTaskStatus(taskId, internId, status);

        res.status(200).json({
            status: "success",
            message: "Cập nhật trạng thái thành công!"
        });
    });

    // 4. MENTOR CHẤM ĐIỂM BÀI LÀM
    static evaluateTask = asyncHandler(async (req: AuthRequest, res: Response) => {
        const mentorId = req.user?.id;
        const taskId = req.params.id as string;
        const { score } = req.body;

        if (!mentorId) throw new AppError("Không xác định được danh tính!", 401);

        await TaskService.evaluateTask(taskId, mentorId, score);

        res.status(200).json({
            status: "success",
            message: `Đã nghiệm thu và chấm ${score} điểm!`
        });
    });
}
