import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware";
import { ApplicationController } from "../controllers/applicationController";


const router = Router();

// API cập nhật trạng thái đơn xin việc (chỉ Admin và HR mới được cập nhật)
router.put('/:id/status',
    authenticateJWT,
    authorizeRoles('ADMIN', 'HR'),
    ApplicationController.updateStatus
)
export default router;
