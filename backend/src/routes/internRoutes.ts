import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware";
import { InternController } from "../controllers/internController";


const router = Router();

// Lớp kẹp Middleware: Chỉ có HR hoặc ADMIN mới có đặc quyền nhập hồ sơ
router.post('/profile',
    authenticateJWT,
    authorizeRoles('ADMIN', 'HR'),
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

export default router;