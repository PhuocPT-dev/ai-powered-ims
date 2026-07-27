import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { registerSchema, loginSchema, changePasswordSchema } from '../validators/authValidator';

const router = Router();
// Khai báo URL là /register. Phương thức là POST (vì có gửi dữ liệu bảo mật).
// Khi có ai gọi vào đây, Router sẽ chỉ tay nhờ hàm register của AuthController ra xử lý

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản người dùng mới
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: teo@gmail.com
 *               password:
 *                 type: string
 *                 example: MySecure@123
 *                 minLength: 8
 *               password_confirm:
 *                 type: string
 *                 example: MySecure@123
 *                 minLength: 8
 *               full_name:
 *                 type: string
 *                 example: Nguyễn Văn Tèo
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 */


import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 5, // Tối đa 5 lần thử
    message: { message: 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', loginLimiter, validate(loginSchema), AuthController.login);
router.post('/refresh', AuthController.refreshToken);



// Chú ý: Ta kẹp anh bảo vệ 'authenticateJWT' đứng chắn giữa cái URL và cái Controller!
router.get('/me', authenticateJWT, AuthController.getCurrentUser);
router.post('/change-password', authenticateJWT, validate(changePasswordSchema), AuthController.changePassword);

export default router;