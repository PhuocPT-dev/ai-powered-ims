import { Router } from 'express';
import { FeedbackController } from '../controllers/feedbackController';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { feedbackSchema } from '../validators/feedbackValidator';

const router = Router();


router.post(
    '/',
    authenticateJWT,
    authorizeRoles('INTERN'),
    validate(feedbackSchema),
    FeedbackController.submitFeedback
);


router.get(
    '/mentor/:mentorId',
    authenticateJWT,
    authorizeRoles('ADMIN', 'HR', 'COORDINATOR', 'MENTOR'),
    FeedbackController.getMentorFeedbacks
);

export default router;

