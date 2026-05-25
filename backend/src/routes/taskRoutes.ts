import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';
const router = Router();
// Giao Task
router.post(
    '/',
    authenticateJWT,
    authorizeRoles('ADMIN', 'MENTOR'),
    TaskController.createTask
);

router.get(
    '/intern/:internId',
    authenticateJWT,
    authorizeRoles('ADMIN', 'MENTOR', 'INTERN'),
    TaskController.getTasksByIntern
);

// Lộ trình 3: Cập nhật tiến độ (Chỉ dành riêng cho Intern tự bấm)
router.put(
    '/:taskId/status',
    authenticateJWT,
    authorizeRoles('INTERN'),
    TaskController.updateTaskStatus
);
//Mentor chấm điểm
router.put(
    '/:taskId/evaluate',
    authenticateJWT,
    authorizeRoles('ADMIN', 'MENTOR'),
    TaskController.evaluateTask
)
export default router;