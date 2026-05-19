import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware";
import { ApplicationController } from "../controllers/applicationController";


const router = Router();

// API: Đổi trạng thái Đơn xin việc
router.put('/:id/status',
    authenticateJWT,
    authorizeRoles('ADMIN', 'COORDINATOR'),
    ApplicationController.updateStatus
)
export default router;
