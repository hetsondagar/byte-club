import { Request, Response } from 'express';
import { ByteRushScore, POWERUP_DEFINITIONS, GAME_CONFIG } from '../models/ByteRush';
import logger from '../config/logger';

// BYTECLUB: Interface for brick-breaker score submission request
interface ScoreSubmissionRequest {
  userId?: string;
  displayName?: string;
  score: number;
  bricksBroken: number;
  powerupsUsed: string[];
  runDurationMs: number;
  clientGameVersion?: string;
}

// BYTECLUB: Interface for leaderboard response
interface LeaderboardEntry {
  rank: number;
  displayName: string;
  score: number;
  bricksBroken: number;
  runDurationMs: number;
  powerupsUsed: string[];
  createdAt: Date;
}

export class ByteRushController {
  // BYTECLUB: Submit a new score to the leaderboard
  static async submitScore(req: Request, res: Response): Promise<void> {
    try {
      const {
        userId,
        displayName = 'Anonymous',
        score,
        bricksBroken,
        powerupsUsed = [],
        runDurationMs,
        clientGameVersion = '1.0.0'
      }: ScoreSubmissionRequest = req.body;

      // BYTECLUB: Validate required fields
      if (typeof score !== 'number' || typeof bricksBroken !== 'number' || 
          typeof runDurationMs !== 'number') {
        res.status(400).json({
          success: false,
          message: 'Invalid score data: score, bricksBroken, and runDurationMs must be numbers'
        });
        return;
      }

      // BYTECLUB: Validate score ranges
      if (score < 0 || score > GAME_CONFIG.MAX_SCORE) {
        res.status(400).json({
          success: false,
          message: `Score must be between 0 and ${GAME_CONFIG.MAX_SCORE}`
        });
        return;
      }

      if (bricksBroken < 0 || bricksBroken > GAME_CONFIG.MAX_BRICKS) {
        res.status(400).json({
          success: false,
          message: `Bricks broken must be between 0 and ${GAME_CONFIG.MAX_BRICKS}`
        });
        return;
      }

      if (runDurationMs < GAME_CONFIG.MIN_RUN_DURATION || runDurationMs > GAME_CONFIG.MAX_RUN_DURATION) {
        res.status(400).json({
          success: false,
          message: `Run duration must be between ${GAME_CONFIG.MIN_RUN_DURATION}ms and ${GAME_CONFIG.MAX_RUN_DURATION}ms`
        });
        return;
      }

      // BYTECLUB: Validate powerups
      const validPowerups = Object.keys(POWERUP_DEFINITIONS);
      const invalidPowerups = powerupsUsed.filter(powerup => !validPowerups.includes(powerup));
      if (invalidPowerups.length > 0) {
        res.status(400).json({
          success: false,
          message: `Invalid powerups: ${invalidPowerups.join(', ')}`
        });
        return;
      }

      // BYTECLUB: Anti-cheat validation
      const scorePerBrick = score / Math.max(bricksBroken, 1);
      if (scorePerBrick > 200) {
        logger.warn(`🚨 Suspicious score submission: ${scorePerBrick.toFixed(2)} points per brick`, {
          userId,
          score,
          bricksBroken,
          runDurationMs
        });
        res.status(400).json({
          success: false,
          message: 'Score-to-bricks ratio appears suspicious'
        });
        return;
      }

      const bricksPerSecond = bricksBroken / (runDurationMs / 1000);
      if (bricksPerSecond > 5) {
        logger.warn(`🚨 Suspicious speed submission: ${bricksPerSecond.toFixed(2)} bricks per second`, {
          userId,
          score,
          bricksBroken,
          runDurationMs
        });
        res.status(400).json({
          success: false,
          message: 'Bricks-per-second ratio appears suspicious'
        });
        return;
      }

      // BYTECLUB: Create new score entry
      const newScore = new ByteRushScore({
        userId,
        displayName: displayName.trim().substring(0, 50),
        score,
        bricksBroken,
        powerupsUsed,
        runDurationMs,
        clientGameVersion
      });

      await newScore.save();

      logger.info(`🎮 New Byte Rush score submitted`, {
        userId,
        displayName,
        score,
        bricksBroken,
        runDurationMs,
        powerupsUsed: powerupsUsed.length
      });

      // BYTECLUB: Get updated leaderboard position
      const leaderboard = await ByteRushScore.getLeaderboard(50);
      const rank = leaderboard.findIndex(entry => entry._id.toString() === newScore._id.toString()) + 1;

      res.status(201).json({
        success: true,
        message: 'Score submitted successfully',
        data: {
          scoreId: newScore._id,
          rank: rank > 0 ? rank : 'Not in top 50',
          leaderboard: leaderboard.slice(0, 10) // Return top 10 for immediate feedback
        }
      });

    } catch (error) {
      logger.error('❌ Error submitting Byte Rush score:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit score',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // BYTECLUB: Get leaderboard with optional limit
  static async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100); // Max 100 entries
      
      const leaderboard = await ByteRushScore.getLeaderboard(limit);
      
      // BYTECLUB: Add rank numbers to entries
      const rankedLeaderboard: LeaderboardEntry[] = leaderboard.map((entry, index) => ({
        rank: index + 1,
        displayName: entry.displayName,
        score: entry.score,
        bricksBroken: entry.bricksBroken,
        runDurationMs: entry.runDurationMs,
        powerupsUsed: entry.powerupsUsed,
        createdAt: entry.createdAt
      }));

      res.json({
        success: true,
        data: {
          leaderboard: rankedLeaderboard,
          totalEntries: leaderboard.length,
          lastUpdated: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('❌ Error fetching Byte Rush leaderboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch leaderboard',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // BYTECLUB: Get user's best score
  static async getUserBestScore(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
        return;
      }

      const bestScore = await ByteRushScore.getUserBestScore(userId);

      if (!bestScore) {
        res.json({
          success: true,
          data: {
            bestScore: null,
            message: 'No scores found for this user'
          }
        });
        return;
      }

      // BYTECLUB: Get user's rank
      const leaderboard = await ByteRushScore.getLeaderboard(1000); // Get more entries for rank calculation
      const rank = leaderboard.findIndex(entry => entry._id.toString() === bestScore._id.toString()) + 1;

      res.json({
        success: true,
        data: {
          bestScore: {
            ...bestScore,
            rank: rank > 0 ? rank : 'Not in top 1000'
          }
        }
      });

    } catch (error) {
      logger.error('❌ Error fetching user best score:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user best score',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // BYTECLUB: Get user's recent scores
  static async getUserRecentScores(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50); // Max 50 entries

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
        return;
      }

      const recentScores = await ByteRushScore.getUserRecentScores(userId, limit);

      res.json({
        success: true,
        data: {
          recentScores,
          totalEntries: recentScores.length
        }
      });

    } catch (error) {
      logger.error('❌ Error fetching user recent scores:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user recent scores',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // BYTECLUB: Get game statistics
  static async getGameStats(req: Request, res: Response): Promise<void> {
    try {
      const totalScores = await ByteRushScore.countDocuments();
      const totalPlayers = await ByteRushScore.distinct('userId').then(users => users.filter(Boolean).length);
      const totalAnonymousPlayers = await ByteRushScore.countDocuments({ userId: { $exists: false } });
      
      const averageScore = await ByteRushScore.aggregate([
        { $group: { _id: null, avgScore: { $avg: '$score' } } }
      ]).then(result => result[0]?.avgScore || 0);

      const averageBricks = await ByteRushScore.aggregate([
        { $group: { _id: null, avgBricks: { $avg: '$bricksBroken' } } }
      ]).then(result => result[0]?.avgBricks || 0);

      const powerupUsage = await ByteRushScore.aggregate([
        { $unwind: '$powerupsUsed' },
        { $group: { _id: '$powerupsUsed', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      res.json({
        success: true,
        data: {
          totalScores,
          totalPlayers: totalPlayers + totalAnonymousPlayers,
          registeredPlayers: totalPlayers,
          anonymousPlayers: totalAnonymousPlayers,
          averageScore: Math.round(averageScore),
          averageBricks: Math.round(averageBricks),
          powerupUsage: powerupUsage.map(p => ({
            powerup: p._id,
            count: p.count,
            percentage: Math.round((p.count / totalScores) * 100)
          })),
          lastUpdated: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('❌ Error fetching game statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch game statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // BYTECLUB: Get powerup definitions
  static async getPowerupDefinitions(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        data: {
          powerups: POWERUP_DEFINITIONS,
          gameConfig: GAME_CONFIG
        }
      });
    } catch (error) {
      logger.error('❌ Error fetching powerup definitions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch powerup definitions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
