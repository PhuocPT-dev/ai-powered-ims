import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware";
import { TrainingController } from "../controllers/trainingController";
import { validate } from "../middlewares/validateMiddleware";
import { createProgramSchema, enrollInternSchema } from "../validators/trainingValidator";

const router = Router();

router.use(authenticateJWT, authorizeRoles('ADMIN', 'COORDINATOR'));

//khởi tạo kháo học
router.post('/', validate(createProgramSchema), TrainingController.createProgram);

//Mời 1 intern vào khóa học
router.post('/:trainingId/enroll', validate(enrollInternSchema), TrainingController.enrollIntern);

export default router