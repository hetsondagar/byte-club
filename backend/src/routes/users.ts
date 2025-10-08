import { Router } from 'express';
import { getUser, updateUser, getLeaderboard, getUserEarned } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest, userUpdateSchema } from '../middleware/validation';

const router = Router();

// Public routes (must come before parameterized routes)
router.get('/leaderboard', getLeaderboard);

// Protected routes
router.get('/:id', authenticateToken, getUser);
router.patch('/:id', authenticateToken, validateRequest(userUpdateSchema), updateUser);
router.get('/:id/earned', authenticateToken, getUserEarned);

export default router;
