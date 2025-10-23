import express from 'express';
import { ByteRushController } from '../controllers/byteRushController';
import { authenticateToken } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

// BYTECLUB: Rate limiting for score submissions to prevent spam
const scoreSubmissionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Maximum 5 score submissions per minute per IP
  message: {
    success: false,
    message: 'Too many score submissions. Please wait before submitting again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// BYTECLUB: Rate limiting for leaderboard requests
const leaderboardLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 30, // Maximum 30 requests per 10 seconds per IP
  message: {
    success: false,
    message: 'Too many leaderboard requests. Please wait before requesting again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();

// BYTECLUB: Submit score endpoint (with rate limiting)
router.post('/score', scoreSubmissionLimiter, async (req, res) => {
  await ByteRushController.submitScore(req, res);
});

// BYTECLUB: Get leaderboard endpoint (with rate limiting)
router.get('/leaderboard', leaderboardLimiter, async (req, res) => {
  await ByteRushController.getLeaderboard(req, res);
});

// BYTECLUB: Get user's best score (authenticated)
router.get('/me/best', authenticateToken, async (req, res) => {
  // Extract userId from authenticated request
  const userId = (req as any).user?.userId;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User ID not found in token'
    });
  }
  
  // Set userId in params for the controller
  req.params.userId = userId;
  await ByteRushController.getUserBestScore(req, res);
});

// BYTECLUB: Get user's recent scores (authenticated)
router.get('/me/recent', authenticateToken, async (req, res) => {
  // Extract userId from authenticated request
  const userId = (req as any).user?.userId;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User ID not found in token'
    });
  }
  
  // Set userId in params for the controller
  req.params.userId = userId;
  await ByteRushController.getUserRecentScores(req, res);
});

// BYTECLUB: Get user's best score by userId (public endpoint for specific user)
router.get('/user/:userId/best', async (req, res) => {
  await ByteRushController.getUserBestScore(req, res);
});

// BYTECLUB: Get user's recent scores by userId (public endpoint for specific user)
router.get('/user/:userId/recent', async (req, res) => {
  await ByteRushController.getUserRecentScores(req, res);
});

// BYTECLUB: Get game statistics (public endpoint)
router.get('/stats', async (req, res) => {
  await ByteRushController.getGameStats(req, res);
});

// BYTECLUB: Get powerup definitions and game config (public endpoint)
router.get('/config', async (req, res) => {
  await ByteRushController.getPowerupDefinitions(req, res);
});

// BYTECLUB: Health check for Byte Rush API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Byte Rush API is running',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/byte-rush/score - Submit a score',
      'GET /api/byte-rush/leaderboard - Get leaderboard',
      'GET /api/byte-rush/me/best - Get user\'s best score (auth required)',
      'GET /api/byte-rush/me/recent - Get user\'s recent scores (auth required)',
      'GET /api/byte-rush/user/:userId/best - Get specific user\'s best score',
      'GET /api/byte-rush/user/:userId/recent - Get specific user\'s recent scores',
      'GET /api/byte-rush/stats - Get game statistics',
      'GET /api/byte-rush/config - Get powerup definitions and game config'
    ]
  });
});

export default router;
