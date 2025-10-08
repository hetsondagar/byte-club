import { Router } from 'express';
import { purchaseReward } from '../controllers/rewardController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/purchase/:key', authenticateToken, purchaseReward);

export default router;
