import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as byteRushController from '../controllers/byteRushController';

const router = Router();

// BYTECLUB: Byte Rush routes
/*
 * Byte Rush Game Routes:
 * - POST /api/byterush/score - Submit a score (auth required)
 * - GET /api/byterush/leaderboard - Get leaderboard
 * - GET /api/byterush/me/best - Get user's best score (auth required)
 * - GET /api/byterush/me/recent - Get user's recent scores (auth required)
 * - GET /api/byterush/stats - Get game statistics
 */

// Public routes
router.get('/leaderboard', byteRushController.getLeaderboard);
router.get('/stats', byteRushController.getStats);

// Protected routes
router.post('/score', authenticateToken, byteRushController.submitScore);
router.get('/me/best', authenticateToken, byteRushController.getUserBestScore);
router.get('/me/recent', authenticateToken, byteRushController.getUserRecentScores);

export default router;
