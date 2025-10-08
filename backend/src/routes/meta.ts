import { Router } from 'express';
import { getMeta, seedMeta } from '../controllers/metaController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/:type', getMeta);
router.post('/seed', authenticateToken, requireAdmin, seedMeta);

export default router;
