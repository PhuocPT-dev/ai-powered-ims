import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

// 1. MENTOR GIAO TASK 
router.post(
    '/',
    authenticateJWT,
    authorizeRoles('ADMIN', 'MENTOR'),
    TaskController.createTask
);

// 2. INTERN XEM BẢNG CÔNG VIỆC 
router.get(
    '/my-tasks',
    authenticateJWT,
    authorizeRoles('INTERN'),
    TaskController.getMyTasks
);

// 3. INTERN KÉO THẢ TASK SANG CỘT KHÁC 
router.patch(
    '/:id/status',
    authenticateJWT,
    authorizeRoles('INTERN'),
    TaskController.updateTaskStatus
);

// 4. MENTOR CHẤM ĐIỂM BÀI LÀM
router.patch(
    '/:id/evaluate',
    authenticateJWT,
    authorizeRoles('ADMIN', 'MENTOR'),
    TaskController.evaluateTask
);

export default router;
