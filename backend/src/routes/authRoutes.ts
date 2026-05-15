import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();
// Khai báo URL là /register. Phương thức là POST (vì có gửi dữ liệu bảo mật).
// Khi có ai gọi vào đây, Router sẽ chỉ tay nhờ hàm register của AuthController ra xử lý

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Chú ý: Ta kẹp anh bảo vệ 'authenticateJWT' đứng chắn giữa cái URL và cái Controller!
router.get('/me', authenticateJWT, (req: any, res: any) => {
    res.status(200).json({
        message: "Bạn đã lọt qua chốt kiểm tra an ninh",
        thong_tin_cua_ban: req.user
    })
})

// Chú ý: Ở đây ta kẹp tận 2 anh bảo vệ đứng nối tiếp nhau!
// Anh số 1 (authenticateJWT) soi thẻ thật giả.
// Anh số 2 (authorizeRoles) soi chức danh. Ở đây ta quy định chỉ cho 'ADMIN' vào.
router.get('/admin-only', authenticateJWT, authorizeRoles('ADMIN'), (req: any, res: any) => {
    res.status(200).json({
        mesage: "Chào mừng ngài chủ tịch đã đến vvawn phòng!"
    })
})
export default router;