import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { createUserSchema, updateRoleSchema, toggleStatusSchema } from '../validators/adminValidator';

const router = Router();


router.use(authenticateJWT, authorizeRoles('ADMIN'));

router.put('/users/:id/status', validate(toggleStatusSchema), AdminController.toggleUserStatus);
router.put('/users/:id/reset-password', AdminController.resetPassword);

router.get('/users', AdminController.getAllUsers);
router.post('/users', validate(createUserSchema), AdminController.createUser);
router.patch('/users/:id/role', validate(updateRoleSchema), AdminController.updateRole);

export default router;



