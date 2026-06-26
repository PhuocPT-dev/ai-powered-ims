import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { FeedbackService } from "../service/feedbackService";

export class FeedbackController {
    static submitFeedback = asyncHandler(async (req: AuthRequest, res: Response) => {
        const intern_id = req.user?.id;
        if (!intern_id) throw new AppError("Không xác định được danh tính", 401);
        
        const { mentor_id, rating, comment, is_anonymous } = req.body;

        await FeedbackService.createFeedback(intern_id, mentor_id, rating, comment, is_anonymous || false);

        res.status(201).json({ status: "success", message: "Cảm ơn bạn đã dũng cảm gửi đánh giá!" });
    });

    static getMentorFeedbacks = asyncHandler(async (req: Request, res: Response) => {
        const mentorId = req.params.mentorId as string;

        const feedbacks = await FeedbackService.getFeedbacksByMentor(mentorId);
        
        const secureFeedbacks = feedbacks.map((fb: any) => {
            if (fb.is_anonymous === 1) {
                fb.intern_name = "Thực tập sinh giấu tên 🕵️";
            }
            return fb;
        });
        
        res.json({ status: "success", data: secureFeedbacks });
    });

    static getMentors = asyncHandler(async (req: Request, res: Response) => {
        const mentors = await FeedbackService.getMentors();
        res.status(200).json({ status: "success", data: mentors });
    });
}