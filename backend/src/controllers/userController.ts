import { Request, Response } from 'express';
import { User, Attempt } from '../models';
import QuestProgress from '../models/Quest';
import { updateUserXP, calculateLevel } from '../utils/xp';
import { checkAndUnlockBadges } from '../utils/badges';
import logger from '../config/logger';

// Adventure node XP mapping (should match frontend adventureMapData.ts)
const ADVENTURE_NODE_XP: { [key: string]: number } = {
  '1': 150, '2': 150, '3': 200, '4': 150, '5': 150, '6': 200, '7': 150, '8': 150, '9': 200, '10': 150,
  '11': 150, '12': 200, '13': 150, '14': 200, '15': 150, '16': 200, '17': 150, '18': 150, '19': 200, '20': 150,
  '21': 150, '22': 200, '23': 150, '24': 200, '25': 150, '26': 150, '27': 200, '28': 150, '29': 200, '30': 150,
  '31': 150, '32': 200, '33': 150, '34': 200, '35': 150, '36': 150, '37': 200, '38': 150, '39': 200, '40': 150,
  '41': 150, '42': 200, '43': 150, '44': 200, '45': 150, '46': 150, '47': 200, '48': 150, '49': 200, '50': 150,
  '51': 150, '52': 200, '53': 150, '54': 200, '55': 150, '56': 150, '57': 200, '58': 150, '59': 200, '60': 150,
  '61': 150, '62': 200, '63': 150, '64': 200, '65': 150, '66': 150, '67': 200, '68': 150, '69': 200, '70': 150,
  '71': 150, '72': 200, '73': 150, '74': 200, '75': 150, '76': 150, '77': 200, '78': 150, '79': 200, '80': 150,
  '81': 150, '82': 200, '83': 150, '84': 200, '85': 150, '86': 150, '87': 200, '88': 150, '89': 200, '90': 150,
  '91': 150, '92': 200, '93': 150, '94': 200, '95': 150, '96': 150, '97': 200, '98': 150, '99': 200, '100': 150
};

// Function to calculate actual adventure XP based on completed nodes
function calculateAdventureXP(completedNodes: string[]): number {
  return completedNodes.reduce((total, nodeId) => {
    return total + (ADVENTURE_NODE_XP[nodeId] || 150); // Default to 150 if not found
  }, 0);
}

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

    return res.json({
      success: true,
      message: 'User retrieved successfully',
      data: { user }
    });
  } catch (error) {
    logger.error('Get user error:', error);
    return res.status(500).json({
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

    logger.info(`User updated: ${(user as any).username}`);

    return res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    logger.error('Update user error:', error);
    return res.status(500).json({
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

    if (type === 'challenges') {
      // Challenges leaderboard - XP earned from challenge completions
      leaderboard = await Attempt.aggregate([
        {
          $match: {
            isCorrect: true,
            challengeSlug: { $exists: true, $ne: null } // Only challenge attempts
          }
        },
        {
          $group: {
            _id: '$userId',
            totalXP: { $sum: '$xpEarned' },
            challengesCompleted: { $sum: 1 }
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
            totalXP: 1, // XP from challenges only
            lifetimeXP: '$user.totalXP', // Total lifetime XP for level calculation
            currentLevel: '$user.currentLevel',
            currentStreak: '$user.currentStreak',
            badges: '$user.badges',
            challengesCompleted: 1
          }
        },
        {
          $sort: { totalXP: -1 }
        },
        {
          $limit: 50
        }
      ]);
      
      // Include all users (with 0 challenge XP if they haven't completed any)
      const allUsers = await User.find()
        .select('username totalXP currentLevel currentStreak badges completedChallenges')
        .sort({ totalXP: -1 })
        .limit(50);
      
      const challengeActivityMap = new Map();
      leaderboard.forEach(entry => {
        challengeActivityMap.set(entry._id.toString(), entry);
      });
      
      leaderboard = allUsers.map(user => {
        const userId = user._id.toString();
        const challengeActivity = challengeActivityMap.get(userId);
        
        if (challengeActivity) {
          return {
            _id: user._id,
            username: (user as any).username || 'Unknown User',
            totalXP: challengeActivity.totalXP,
            lifetimeXP: (user as any).totalXP || 0,
            currentLevel: (user as any).currentLevel || 1,
            currentStreak: (user as any).currentStreak || 0,
            badges: (user as any).badges || [],
            challengesCompleted: challengeActivity.challengesCompleted || 0
          };
        } else {
          return {
            _id: user._id,
            username: (user as any).username || 'Unknown User',
            totalXP: 0,
            lifetimeXP: (user as any).totalXP || 0,
            currentLevel: (user as any).currentLevel || 1,
            currentStreak: (user as any).currentStreak || 0,
            badges: (user as any).badges || [],
            challengesCompleted: 0
          };
        }
      });
      
      leaderboard.sort((a, b) => b.totalXP - a.totalXP);
      
    } else if (type === 'adventure') {
      // Adventure leaderboard - Based on completed adventure nodes
      // Since adventure completions are stored in User.completedAdventureNodes,
      // we'll calculate XP based on the number of completed nodes
      const allUsers = await User.find()
        .select('username totalXP currentLevel currentStreak badges completedAdventureNodes')
        .sort({ totalXP: -1 })
        .limit(50);
      
      leaderboard = allUsers.map(user => {
        const completedNodes = (user as any).completedAdventureNodes || [];
        const adventureNodesCompleted = completedNodes.length;
        // Calculate actual XP based on completed adventure nodes
        const adventureXP = calculateAdventureXP(completedNodes);
        
        return {
          _id: user._id,
          username: (user as any).username || 'Unknown User',
          totalXP: adventureXP,
          lifetimeXP: (user as any).totalXP || 0,
          currentLevel: (user as any).currentLevel || 1,
          currentStreak: (user as any).currentStreak || 0,
          badges: (user as any).badges || [],
          adventureNodesCompleted: adventureNodesCompleted
        };
      });
      
      leaderboard.sort((a, b) => b.totalXP - a.totalXP);
      
    } else if (type === 'quests') {
      // Quests leaderboard - Based on quest progress
      // Get all users and their quest progress
      const allUsers = await User.find()
        .select('username totalXP currentLevel currentStreak badges')
        .sort({ totalXP: -1 })
        .limit(50);
      
      // Get quest progress for all users
      const questProgress = await QuestProgress.find({});
      const questProgressMap = new Map();
      
      questProgress.forEach((progress: any) => {
        const userId = progress.userId.toString();
        if (!questProgressMap.has(userId)) {
          questProgressMap.set(userId, []);
        }
        questProgressMap.get(userId).push(progress);
      });
      
      leaderboard = allUsers.map(user => {
        const userId = user._id.toString();
        const userQuestProgress = questProgressMap.get(userId) || [];
        
        // Calculate total quest XP and missions completed
        let questXP = 0;
        let questMissionsCompleted = 0;
        
        userQuestProgress.forEach((progress: any) => {
          questXP += progress.totalXPEarned || 0;
          questMissionsCompleted += progress.completedMissions?.length || 0;
        });
        
        return {
          _id: user._id,
          username: (user as any).username || 'Unknown User',
          totalXP: questXP,
          lifetimeXP: (user as any).totalXP || 0,
          currentLevel: (user as any).currentLevel || 1,
          currentStreak: (user as any).currentStreak || 0,
          badges: (user as any).badges || [],
          questMissionsCompleted: questMissionsCompleted
        };
      });
      
      leaderboard.sort((a, b) => b.totalXP - a.totalXP);
    } else {
      // All-time leaderboard
      const allTimeUsers = await User.find()
        .select('username totalXP currentLevel currentStreak badges')
        .sort({ totalXP: -1 })
        .limit(50);
      
      // Add lifetimeXP field for consistency
      leaderboard = allTimeUsers.map(user => ({
        _id: user._id,
        username: (user as any).username,
        totalXP: (user as any).totalXP,
        lifetimeXP: (user as any).totalXP, // Same as totalXP for all-time
        currentLevel: (user as any).currentLevel,
        currentStreak: (user as any).currentStreak,
        badges: (user as any).badges
      }));
    }

    // Add rank to each entry and ensure data integrity
    const leaderboardWithRank = leaderboard.map((entry, index) => {
      const totalXP = entry.totalXP || 0;
      // For weekly/monthly, use lifetimeXP for level calculation, otherwise use totalXP
      const xpForLevel = entry.lifetimeXP || totalXP;
      const calculatedLevel = calculateLevel(xpForLevel);
      
      return {
        _id: entry._id || `unknown-${index}`,
        username: entry.username || 'Unknown User',
        totalXP: totalXP,
        currentLevel: calculatedLevel, // Use calculated level from lifetime XP
        currentStreak: entry.currentStreak || 0,
        badges: Array.isArray(entry.badges) ? entry.badges : [],
        rank: index + 1
      };
    });

    logger.info(`✅ Leaderboard retrieved: ${leaderboardWithRank.length} entries`, {
      type,
      entryCount: leaderboardWithRank.length,
      sampleEntry: leaderboardWithRank[0] || null,
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

    return res.json({
      success: true,
      message: 'User earned data retrieved successfully',
      data: {
        badges: (user as any).badges,
        rewards: (user as any).rewards,
        completedChallenges: (user as any).completedChallenges
      }
    });
  } catch (error) {
    logger.error('Get user earned error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
