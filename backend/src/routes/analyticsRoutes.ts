import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

router.get(
    '/dashboard',
    authenticateJWT,
    authorizeRoles('ADMIN', 'HR', 'COORDINATOR'),
    AnalyticsController.getDashboardStats
);

export default router;
