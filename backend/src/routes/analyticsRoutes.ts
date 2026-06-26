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

// 1. Thống kê theo tháng
router.get(
    '/monthly',
    authenticateJWT,
    authorizeRoles('ADMIN', 'HR', 'COORDINATOR'),
    AnalyticsController.getMonthlyStats
);

// 2. Thống kê theo Training Program
router.get(
    '/trainings',
    authenticateJWT,
    authorizeRoles('ADMIN', 'COORDINATOR'),
    AnalyticsController.getTrainingStats
);

// 3. Thống kê KPI từng Intern
router.get(
    '/interns/:id/kpi',
    authenticateJWT,
    authorizeRoles('ADMIN', 'MENTOR', 'HR', 'COORDINATOR', 'INTERN'),
    AnalyticsController.getInternKPI
);

export default router;
