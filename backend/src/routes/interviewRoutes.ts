import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware";
import { InterviewController } from "../controllers/interviewController";
import { validate } from "../middlewares/validateMiddleware";
import { scheduleInterviewSchema } from "../validators/interviewValidator";

const router = Router();

// Lấy danh sách lịch phỏng vấn
router.get('/', authenticateJWT, authorizeRoles('COORDINATOR', 'ADMIN', 'HR'), InterviewController.getAllInterviews);

// Ứng viên xem lịch của mình
router.get('/my-interviews', authenticateJWT, authorizeRoles('CANDIDATE'), InterviewController.getMyInterviews);

// Lớp khiên: Bắt buộc phải là Coordinator hoặc Admin mới được phép lên lịch phỏng vấn
router.post('/schedule',
    authenticateJWT,
    authorizeRoles('COORDINATOR', 'ADMIN'),
    validate(scheduleInterviewSchema),
    InterviewController.scheduleInterview
);

// Cập nhật trạng thái phỏng vấn
router.patch('/:id/status', authenticateJWT, authorizeRoles('COORDINATOR', 'ADMIN', 'HR'), InterviewController.updateStatus);

export default router;