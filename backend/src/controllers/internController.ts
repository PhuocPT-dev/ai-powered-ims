import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { InternService } from "../service/internService";

export class InternController {
    static createProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
        const user_id = req.user?.id;
        if (!user_id) throw new AppError("Không xác định được danh tính", 401);
        
        const { university, major, skills, emergency_contact } = req.body;

        const role = await InternService.getRoleByUserId(user_id);
        if (!role) {
            throw new AppError("Không tìm thấy người dùng này!", 404);
        }
        if (role !== 'INTERN') {
            throw new AppError("Người này chưa được thăng cấp làm Thực tập sinh, không thể tạo hồ sơ bảo mật!", 400);
        }

        const profileId = await InternService.createProfile(user_id, university, major, skills, emergency_contact);
        
        res.status(201).json({
            status: "success",
            message: "Tạo hồ sơ Intern thành công!",
            profileId: profileId
        });
    });

    static getProfile = asyncHandler(async (req: Request, res: Response) => {
        const userID = req.params.userId as string;

        const profile = await InternService.getProfileByUserId(userID);
        if (!profile) {
            throw new AppError("Không tìm thấy thông tin hồ sơ này.", 404);
        }
        
        res.status(200).json({ status: "success", data: profile });
    });

    static updateProfile = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.params.userId as string;
        const { university, major, skills, emergency_contact } = req.body;
        
        const updated = await InternService.updateProfile(userId, university, major, skills, emergency_contact);

        if (!updated) {
            throw new AppError("Không tìm thấy hồ sơ để cập nhật!", 404);
        }
        res.status(200).json({ status: "success", message: "Đã cập nhật hồ sơ thành công!" });
    });

    static getAllInterns = asyncHandler(async (req: Request, res: Response) => {
        const interns = await InternService.getAllInterns();
        res.status(200).json({ status: "success", data: interns });
    });
}