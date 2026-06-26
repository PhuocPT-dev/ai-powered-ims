import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middlewares/authMiddleware";
import { TrainingController } from "../controllers/trainingController";
import { validate } from "../middlewares/validateMiddleware";
import { createProgramSchema, enrollInternSchema } from "../validators/trainingValidator";

const router = Router();

router.use(authenticateJWT, authorizeRoles('ADMIN', 'COORDINATOR'));

// Lấy danh sách khóa học
router.get('/', TrainingController.getAllPrograms);

//khởi tạo kháo học
router.post('/', validate(createProgramSchema), TrainingController.createProgram);

//Mời 1 intern vào khóa học
router.post('/:trainingId/enroll', validate(enrollInternSchema), TrainingController.enrollIntern);

router.get('/:id', TrainingController.getProgramById);
router.get('/:id/members', TrainingController.getProgramMembers);
router.delete('/:id', TrainingController.deleteProgram);

// PATCH /api/trainings/members/:id/status
router.patch('/members/:id/status', TrainingController.updateInternStatus);

export default router;