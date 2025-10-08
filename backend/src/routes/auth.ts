import { Router } from 'express';
import { signup, login, logout, getMe } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest, signupSchema, loginSchema } from '../middleware/validation';
import logger from '../config/logger';

const router = Router();

// Test protected endpoint
router.get('/test-protected', authenticateToken, (req: any, res) => {
  logger.info(`🔒 Protected endpoint accessed by user: ${req.user?.username}`);
  res.json({
    success: true,
    message: 'This endpoint requires authentication',
    user: req.user?.username,
    timestamp: new Date().toISOString()
  });
});

router.post('/signup', validateRequest(signupSchema), signup);
router.post('/login', validateRequest(loginSchema), login);
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getMe);

export default router;
