import { Router } from 'express';
import { getChallenges, getChallenge, submitChallenge } from '../controllers/challengeController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest, challengeSubmissionSchema } from '../middleware/validation';

const router = Router();

router.get('/', getChallenges);
router.get('/:slug', getChallenge);
router.post('/:slug/submit', authenticateToken, validateRequest(challengeSubmissionSchema), submitChallenge);

export default router;
