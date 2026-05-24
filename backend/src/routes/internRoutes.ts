import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware";
import { InternController } from "../controllers/internController";


const router = Router();

router.post(
    '/profile',
    authenticateJWT,
    authorizeRoles('ADMIN', 'COORIDINATOR'),
    InternController.createProfile
)

export default router;