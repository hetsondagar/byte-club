import { Router } from 'express';
import { getMeta, seedMeta } from '../controllers/metaController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Make meta endpoint public (no auth required) so achievements page can load
router.get('/:type', getMeta);
router.post('/seed', authenticateToken, requireAdmin, seedMeta);

export default router;
