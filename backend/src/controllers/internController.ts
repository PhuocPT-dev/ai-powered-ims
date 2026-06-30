import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { InternService } from "../service/internService";
import { AIService } from "../utils/ai";

export class InternController {
    static createProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
        let user_id = req.user?.id;
        if (!user_id) throw new AppError("Không xác định được danh tính", 401);

        const targetUserId = req.params.userId;
        if (targetUserId) {
            // Bảo mật chống IDOR: Intern không được phép tạo profile hộ người khác
            if (req.user?.role === 'INTERN' && req.user?.id !== Number(targetUserId)) {
                throw new AppError("Bạn không có quyền khởi tạo hồ sơ cho người khác!", 403);
            }
            user_id = Number(targetUserId);
        }
        
        let { university, major, skills, emergency_contact } = req.body;
        if (typeof skills === 'string') {
            skills = skills.split(',').map((s: string) => s.trim());
        }
        const skillsJSON = JSON.stringify(skills);

        // Bảo mật chống trùng lặp dữ liệu (1-1 relationship)
        const existingProfile = await InternService.getProfileByUserId(String(user_id));
        if (existingProfile) {
            throw new AppError("Hồ sơ thực tập sinh của người dùng này đã tồn tại!", 400);
        }

        const role = await InternService.getRoleByUserId(user_id);
        if (!role) {
            throw new AppError("Không tìm thấy người dùng này!", 404);
        }
        if (role !== 'INTERN') {
            throw new AppError("Người này chưa được thăng cấp làm Thực tập sinh, không thể tạo hồ sơ!", 400);
        }

        const profileId = await InternService.createProfile(user_id, university, major, skillsJSON, emergency_contact);
        
        res.status(201).json({
            status: "success",
            message: "Tạo hồ sơ Intern thành công!",
            profileId: profileId
        });
    });

    static getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userID = req.params.userId as string;

        // BẢO MẬT: Chống lỗi IDOR. Intern chỉ được phép xem hồ sơ của chính mình.
        if (req.user?.role === 'INTERN' && req.user?.id !== Number(userID)) {
            throw new AppError("Bạn không có quyền xem hồ sơ của người khác!", 403);
        }

        const profile = await InternService.getProfileByUserId(userID);
        if (!profile) {
            throw new AppError("Không tìm thấy thông tin hồ sơ này.", 404);
        }
        
        res.status(200).json({ status: "success", data: profile });
    });

    static updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.params.userId as string;

        // BẢO MẬT: Chống lỗi IDOR. Intern chỉ được phép cập nhật hồ sơ của chính mình.
        if (req.user?.role === 'INTERN' && req.user?.id !== Number(userId)) {
            throw new AppError("Bạn không có quyền cập nhật hồ sơ của người khác!", 403);
        }

        let { university, major, skills, emergency_contact } = req.body;
        if (typeof skills === 'string') {
            skills = skills.split(',').map((s: string) => s.trim());
        }
        const skillsJSON = JSON.stringify(skills);
        
        const updated = await InternService.updateProfile(userId, university, major, skillsJSON, emergency_contact);

        if (!updated) {
            throw new AppError("Không tìm thấy hồ sơ để cập nhật!", 404);
        }
        res.status(200).json({ status: "success", message: "Đã cập nhật hồ sơ thành công!" });
    });

    static getAllInterns = asyncHandler(async (req: Request, res: Response) => {
        const interns = await InternService.getAllInterns();
        res.status(200).json({ status: "success", data: interns });
    });

    static getAISkillSuggestions = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.id;
        if (!userId) throw new AppError("Không xác định được danh tính thực tập sinh", 401);

        const data = await InternService.getInternSkillData(userId);
        if (!data.profile) {
            throw new AppError("Vui lòng khởi tạo hồ sơ cá nhân (Intern Profile) trước khi nhận gợi ý từ AI!", 400);
        }

        const skillsText = Array.isArray(data.profile.skills) 
            ? data.profile.skills.join(', ') 
            : (typeof data.profile.skills === 'string' ? data.profile.skills : "Chưa khai báo kỹ năng");
        const major = data.profile.major || "Chưa rõ chuyên ngành";
        const tasksText = data.tasks.map((t: any) => `- Task: "${t.title}" (${t.description}) - Điểm đánh giá: ${t.score}/100`).join('\n') || "Chưa hoàn thành công việc nào được chấm điểm.";

        const prompt = `
        Bạn là một Mentor AI cấp cao chuyên đào tạo và định hướng phát triển nhân tài tại doanh nghiệp.
        Hãy phân tích dữ liệu học tập và làm việc của Thực tập sinh (Intern) sau đây và đưa ra gợi ý lộ trình phát triển kỹ năng tiếp theo:
        
        [Hồ sơ Intern]
        - Chuyên ngành học: ${major}
        - Kỹ năng hiện có: ${skillsText}
        
        [Kết quả thực hiện Tasks công việc gần đây]
        ${tasksText}

        Hãy phản hồi bằng Tiếng Việt, cấu trúc Markdown rõ ràng, chuyên nghiệp và truyền cảm hứng:
        1. **Đánh giá tổng quan năng lực**: Đánh giá dựa trên kết quả/điểm số của các task đã làm. Điểm số từ 80 trở lên là tốt, dưới 70 cần cải thiện.
        2. **Xác định các lỗ hổng/điểm yếu**: Phân tích xem Intern đang thiếu những kỹ năng gì hoặc cần tối ưu những gì từ các task đó.
        3. **Lộ trình kỹ năng tiếp theo (Skill Development Road)**: Gợi ý cụ thể 3 kỹ năng hoặc công nghệ mới nên học ngay, kèm lý do tại sao và một tài liệu hoặc từ khóa học cụ thể.
        `;

        const suggestion = await AIService.generateContent(prompt);

        res.status(200).json({
            status: "success",
            data: { suggestion }
        });
    });
}