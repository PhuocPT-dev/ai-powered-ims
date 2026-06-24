import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware";
import { InternController } from "../controllers/internController";


const router = Router();

// Lớp kẹp Middleware: Chỉ bản thân INTERN mới được quyền tự tạo hồ sơ của mình
router.post('/profile',
    authenticateJWT,
    authorizeRoles('INTERN'),
    InternController.createProfile
);

// Lấy xem hồ sơ (Admin, HR, Mentor và bản thân Intern đó được quyền xem)
router.get('/profile/:userId',
    authenticateJWT,
    authorizeRoles('ADMIN', 'HR', 'COORDINATOR', 'MENTOR', 'INTERN'),
    InternController.getProfile
);

// Sửa hồ sơ (Chỉ có Admin và HR mới được phép sửa)
router.put('/profile/:userId',
    authenticateJWT,
    authorizeRoles('ADMIN', 'HR'),
    InternController.updateProfile
);

// Lấy danh sách toàn bộ Intern (Cho Mentor giao việc)
router.get('/',
    authenticateJWT,
    authorizeRoles('ADMIN', 'HR', 'MENTOR'),
    InternController.getAllInterns
);

export default router;