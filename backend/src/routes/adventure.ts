import { Router } from 'express';
import { completeAdventureNode, getAdventureProgress } from '../controllers/adventureController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Complete an adventure map node
router.post('/complete', authenticateToken, completeAdventureNode);

// Get user's adventure map progress
router.get('/progress', authenticateToken, getAdventureProgress);

export default router;
