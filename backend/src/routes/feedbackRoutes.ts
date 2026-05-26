import { Router } from 'express';
import { FeedbackController } from '../controllers/feedbackController';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();


router.post(
    '/',
    authenticateJWT,
    authorizeRoles('INTERN'),
    FeedbackController.submitFeedback
);


router.get(
    '/mentor/:mentorId',
    authenticateJWT,
    authorizeRoles('ADMIN', 'HR', 'COORDINATOR', 'MENTOR'),
    FeedbackController.getMentorFeedbacks
);

export default router;

