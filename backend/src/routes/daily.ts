import { Router } from 'express';
import { getDailyChallenge } from '../controllers/dailyController';

const router = Router();

router.get('/', getDailyChallenge);

export default router;
