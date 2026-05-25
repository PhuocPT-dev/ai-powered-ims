import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware";
import { InterviewController } from "../controllers/interviewController";

const router = Router();

// Lớp khiên: Bắt buộc phải là Coordinator hoặc Admin mới được phép lên lịch phỏng vấn
router.post('/schedule',
    authenticateJWT,
    authorizeRoles('COORDINATOR', 'ADMIN'),
    InterviewController.scheduleInterview
);

export default router;