import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware";
import { InterviewController } from "../controllers/interviewController";
import { validate } from "../middlewares/validateMiddleware";
import { scheduleInterviewSchema } from "../validators/interviewValidator";

const router = Router();

// Lớp khiên: Bắt buộc phải là Coordinator hoặc Admin mới được phép lên lịch phỏng vấn
router.post('/schedule',
    authenticateJWT,
    authorizeRoles('COORDINATOR', 'ADMIN'),
    validate(scheduleInterviewSchema),
    InterviewController.scheduleInterview
);

export default router;