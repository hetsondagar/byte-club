import { Router } from 'express';
import { getChallenges, getChallenge, submitChallenge, runCodeForChallenge, runGenericCode } from '../controllers/challengeController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest, challengeSubmissionSchema, codeRunSchema, genericCodeRunSchema } from '../middleware/validation';

const router = Router();

router.get('/', getChallenges);
router.get('/:slug', getChallenge);
router.post('/:slug/submit', authenticateToken, validateRequest(challengeSubmissionSchema), submitChallenge);
router.post('/:slug/run', authenticateToken, validateRequest(codeRunSchema), runCodeForChallenge);
router.post('/run', authenticateToken, validateRequest(genericCodeRunSchema), runGenericCode);

export default router;
