import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware";
import { JobController } from "../controllers/jobController";

const router = Router();

// Kẹp 2 anh bảo vệ nối tiếp nhau:
// Anh 1 (authenticateJWT): Kiểm tra khách có cầm Thẻ JWT thật không.
// Anh 2 (authorizeRoles): Đọc bảng tên xem có phải 'ADMIN' hoặc 'COORDINATOR' không. 
// Nếu đúng mới cho vào gặp hàm createJob.
router.post(
    '/',
    authenticateJWT,
    authorizeRoles('ADMIN', 'COORDINATOR'),
    JobController.createJob
)

router.get('/', JobController.getAllJobs)

export default router;


