import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware";
import { JobController } from "../controllers/jobController";
import { ApplicationController } from "../controllers/applicationController";
import { validate } from '../middlewares/validateMiddleware';
import { createJobSchema } from '../validators/jobValidator';


const router = Router();

// Kẹp 2 anh bảo vệ nối tiếp nhau:
// Anh 1 (authenticateJWT): Kiểm tra khách có cầm Thẻ JWT thật không.
// Anh 2 (authorizeRoles): Đọc bảng tên xem có phải 'ADMIN' hoặc 'HR' không. 
// Nếu đúng mới cho vào Controller xử lý tiếp.
router.post(
    '/',
    authenticateJWT,
    authorizeRoles('ADMIN', 'HR'),
    validate(createJobSchema),
    JobController.createJob
)

router.get('/', JobController.getAllJobs)

router.delete(
    '/:id',
    authenticateJWT,
    authorizeRoles('ADMIN', 'HR'),
    JobController.deleteJob
)

// URL mẫu: /api/jobs/1/apply
router.post(
    '/:id/apply',
    authenticateJWT,
    authorizeRoles('CANDIDATE'),
    ApplicationController.applyJob
)
router.get(
    '/:id/applications', // Lấy toàn bộ CV nộp vào Job có ID tương ứng
    authenticateJWT,
    authorizeRoles('ADMIN', 'COORDINATOR'),
    ApplicationController.getApplication
)

export default router;

