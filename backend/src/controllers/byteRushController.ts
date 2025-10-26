import { Request, Response } from 'express';
import { ByteRushScore } from '../models';
import logger from '../config/logger';

// BYTECLUB: Submit Byte Rush score
export const submitScore = async (req: Request, res: Response) => {
  try {
    const { score, wave, enemiesKilled } = req.body;
    const userId = req.user?._id;
    const username = req.user?.username;

    if (!userId || !username) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!score || typeof score !== 'number' || score < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid score'
      });
    }

    const byteRushScore = new ByteRushScore({
      userId,
      username,
      score,
      wave: wave || 1,
      enemiesKilled: enemiesKilled || 0
    });

    await byteRushScore.save();

    logger.info(`🎮 Byte Rush score submitted: ${username} - ${score} points (Wave ${wave})`);

    res.json({
      success: true,
      message: 'Score saved successfully',
      data: {
        score: byteRushScore.score,
        wave: byteRushScore.wave,
        enemiesKilled: byteRushScore.enemiesKilled
      }
    });
  } catch (error) {
    logger.error('❌ Byte Rush submit score error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save score'
    });
  }
};

// BYTECLUB: Get Byte Rush leaderboard
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const leaderboard = await ByteRushScore.getLeaderboard(limit);

    logger.info(`🎮 Byte Rush leaderboard fetched: ${leaderboard.length} entries`);

    res.json({
      success: true,
      data: {
        leaderboard: leaderboard.map((entry, index) => ({
          rank: index + 1,
          username: entry.username,
          score: entry.score,
          wave: entry.wave,
          enemiesKilled: entry.enemiesKilled,
          createdAt: entry.createdAt
        }))
      }
    });
  } catch (error) {
    logger.error('❌ Byte Rush leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
};

// BYTECLUB: Get user's best Byte Rush score
export const getUserBestScore = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const bestScore = await ByteRushScore.getUserBestScore(userId);

    res.json({
      success: true,
      data: bestScore || null
    });
  } catch (error) {
    logger.error('❌ Byte Rush user best score error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user best score'
    });
  }
};

// BYTECLUB: Get user's recent Byte Rush scores
export const getUserRecentScores = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const recentScores = await ByteRushScore.getUserRecentScores(userId, limit);

    res.json({
      success: true,
      data: recentScores
    });
  } catch (error) {
    logger.error('❌ Byte Rush user recent scores error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user recent scores'
    });
  }
};

// BYTECLUB: Get Byte Rush game statistics
export const getStats = async (req: Request, res: Response) => {
  try {
    const totalScores = await ByteRushScore.countDocuments();
    const topScore = await ByteRushScore.findOne().sort({ score: -1 });
    const averageScore = await ByteRushScore.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalGamesPlayed: totalScores,
        highestScore: topScore?.score || 0,
        highestWave: topScore?.wave || 0,
        averageScore: averageScore[0]?.avgScore || 0
      }
    });
  } catch (error) {
    logger.error('❌ Byte Rush stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats'
    });
  }
};
