import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/authMiddleware';

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
 *                 example: 123456
 *               full_name:
 *                 type: string
 *                 example: Nguyễn Văn Tèo
 *               role:
 *                 type: string
 *                 example: CANDIDATE
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 */


router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Chú ý: Ta kẹp anh bảo vệ 'authenticateJWT' đứng chắn giữa cái URL và cái Controller!
router.get('/me', authenticateJWT, (req: any, res: any) => {
    res.status(200).json({
        message: "Bạn đã lọt qua chốt kiểm tra an ninh",
        thong_tin_cua_ban: req.user
    })
})

router.get('/admin-only', authenticateJWT, authorizeRoles('ADMIN'), (req: any, res: any) => {
    res.status(200).json({
        mesage: "Chào mừng ngài chủ tịch đã đến văn phòng!"
    })
})
export default router;