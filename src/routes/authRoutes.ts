import { Router } from 'express';
import { register, login, verifyEmail, resetPassword, updatePassword } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.post('/reset-password', resetPassword);
router.post('/update-password', updatePassword);

export default router;