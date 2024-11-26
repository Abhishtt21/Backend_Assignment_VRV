import { Router } from 'express';
import { getUser } from '../controllers/userController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

router.get('/me', authenticate, authorize(['Admin', 'User', 'Moderator']), getUser);

export default router;