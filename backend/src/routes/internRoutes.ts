import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware";
import { InternController } from "../controllers/internController";
import { validate } from "../middlewares/validateMiddleware";
import { internProfileSchema } from "../validators/internValidator";


const router = Router();

// Cho phép Intern tự tạo hồ sơ, hoặc ADMIN, HR, MENTOR tạo hộ bằng cách truyền thêm userId qua URL parameter
router.post('/profile/:userId?',
    authenticateJWT,
    authorizeRoles('ADMIN', 'HR', 'MENTOR', 'INTERN'),
    validate(internProfileSchema),
    InternController.createProfile
);

// Lấy xem hồ sơ (Admin, HR, Mentor và bản thân Intern đó được quyền xem)
router.get('/profile/:userId',
    authenticateJWT,
    authorizeRoles('ADMIN', 'HR', 'COORDINATOR', 'MENTOR', 'INTERN'),
    InternController.getProfile
);

// Sửa hồ sơ (Cho phép Admin, HR, Mentor và bản thân Intern sửa)
router.put('/profile/:userId',
    authenticateJWT,
    authorizeRoles('ADMIN', 'HR', 'MENTOR', 'INTERN'),
    validate(internProfileSchema),
    InternController.updateProfile
);

// Gợi ý kỹ năng bằng AI (Chỉ dành cho Intern tự gọi)
router.post('/ai-suggest-skills',
    authenticateJWT,
    authorizeRoles('INTERN'),
    InternController.getAISkillSuggestions
);

// Lấy danh sách toàn bộ Intern (Cho Mentor giao việc)
router.get('/',
    authenticateJWT,
    authorizeRoles('ADMIN', 'HR', 'MENTOR'),
    InternController.getAllInterns
);

export default router;