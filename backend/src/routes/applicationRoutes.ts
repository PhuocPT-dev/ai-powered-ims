import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware";
import { ApplicationController } from "../controllers/applicationController";
import { validate } from "../middlewares/validateMiddleware";
import { updateApplicationStatusSchema } from "../validators/applicationValidator";


const router = Router();

// API lấy danh sách đơn chưa phỏng vấn (dành cho HR/Coordinator xếp lịch)
router.get('/pending',
    authenticateJWT,
    authorizeRoles('ADMIN', 'HR', 'COORDINATOR'),
    ApplicationController.getPendingApplications
)

// API cập nhật trạng thái đơn xin việc (chỉ Admin và HR mới được cập nhật)
router.put('/:id/status',
    authenticateJWT,
    authorizeRoles('ADMIN', 'HR'),
    validate(updateApplicationStatusSchema),
    ApplicationController.updateStatus
)
export default router;
