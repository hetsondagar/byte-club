import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import challengeRoutes from './challenges';
import metaRoutes from './meta';
import rewardRoutes from './rewards';
import dailyRoutes from './daily';
import questRoutes from './quests';
import adventureRoutes from './adventure';
import codeHeistRoutes from './codeHeist';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/challenges', challengeRoutes);
router.use('/meta', metaRoutes);
router.use('/rewards', rewardRoutes);
router.use('/daily', dailyRoutes);
router.use('/quests', questRoutes);
router.use('/adventure', adventureRoutes);
router.use('/code-heist', codeHeistRoutes);

export default router;
