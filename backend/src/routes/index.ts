import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import challengeRoutes from './challenges';
import metaRoutes from './meta';
import rewardRoutes from './rewards';
import dailyRoutes from './daily';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/challenges', challengeRoutes);
router.use('/meta', metaRoutes);
router.use('/rewards', rewardRoutes);
router.use('/daily', dailyRoutes);

export default router;
