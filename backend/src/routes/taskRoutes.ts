import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { createTaskSchema, updateTaskStatusSchema, evaluateTaskSchema } from '../validators/taskValidator';

const router = Router();

// 1. MENTOR GIAO TASK 
router.post(
    '/',
    authenticateJWT,
    authorizeRoles('ADMIN', 'MENTOR'),
    validate(createTaskSchema),
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
    validate(updateTaskStatusSchema),
    TaskController.updateTaskStatus
);

// 4. MENTOR CHẤM ĐIỂM BÀI LÀM
router.patch(
    '/:id/evaluate',
    authenticateJWT,
    authorizeRoles('ADMIN', 'MENTOR'),
    validate(evaluateTaskSchema),
    TaskController.evaluateTask
);

// 5. MENTOR XEM DANH SÁCH TASK ĐÃ GIAO
router.get(
    '/mentor-tasks',
    authenticateJWT,
    authorizeRoles('ADMIN', 'MENTOR'),
    TaskController.getMentorTasks
);

export default router;
