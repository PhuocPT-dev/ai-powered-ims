import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware";
import { TrainingController } from "../controllers/trainingController";

const router = Router();

router.use(authenticateJWT, authorizeRoles('ADMIN', 'COORDINATOR'));

//khởi tạo kháo học
router.post('/', TrainingController.createProgram);

//Mời 1 intern vào khóa học
router.post('/:trainingId/enroll', TrainingController.enrollIntern);

export default router