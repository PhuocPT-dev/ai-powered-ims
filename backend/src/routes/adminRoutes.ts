import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();


router.use(authenticateJWT, authorizeRoles('ADMIN'));

router.put('/users/:id/status', AdminController.toggleUserStatus);
router.put('/users/:id/reset-password', AdminController.resetPassword);

export default router;



