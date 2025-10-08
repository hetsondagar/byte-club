import { Request, Response } from 'express';
import { User, Attempt } from '../models';
import { updateStreak, updateUserXP } from '../utils/xp';
import { checkAndUnlockBadges } from '../utils/badges';
import logger from '../config/logger';

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: { user }
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateUser = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if user is updating themselves or is admin
    if (req.user._id.toString() !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info(`User updated: ${user.username}`);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { type = 'all-time' } = req.query;
    const ip = req.ip || req.connection.remoteAddress || 'Unknown';
    const origin = req.headers.origin || 'Unknown';

    logger.info(`🏆 Leaderboard request: ${type}`, {
      type,
      ip,
      origin,
      timestamp: new Date().toISOString()
    });

    let leaderboard;

    if (type === 'weekly') {
      // Weekly leaderboard based on attempts in last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      leaderboard = await Attempt.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo },
            isCorrect: true
          }
        },
        {
          $group: {
            _id: '$userId',
            totalXP: { $sum: '$xpEarned' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            _id: '$user._id',
            username: '$user.username',
            totalXP: 1,
            currentLevel: '$user.currentLevel'
          }
        },
        {
          $sort: { totalXP: -1 }
        },
        {
          $limit: 50
        }
      ]);
    } else {
      // All-time leaderboard
      leaderboard = await User.find()
        .select('username totalXP currentLevel')
        .sort({ totalXP: -1 })
        .limit(50);
    }

    // Add rank to each entry
    const leaderboardWithRank = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    logger.info(`✅ Leaderboard retrieved: ${leaderboardWithRank.length} entries`, {
      type,
      entryCount: leaderboardWithRank.length,
      ip,
      origin,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Leaderboard retrieved successfully',
      data: {
        leaderboard: leaderboardWithRank,
        type
      }
    });
  } catch (error) {
    logger.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getUserEarned = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('badges rewards completedChallenges');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User earned data retrieved successfully',
      data: {
        badges: user.badges,
        rewards: user.rewards,
        completedChallenges: user.completedChallenges
      }
    });
  } catch (error) {
    logger.error('Get user earned error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
