import { Request, Response } from 'express';
import { User } from '../models';
import { updateUserXP, calculateLevel } from '../utils/xp';
import { checkAndUnlockBadges } from '../utils/badges';
import logger from '../config/logger';

export const completeAdventureNode = async (req: any, res: Response) => {
  try {
    const userId = req.user?._id;
    const { nodeId, xp } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!nodeId || !xp) {
      return res.status(400).json({
        success: false,
        message: 'Node ID and XP are required'
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if node was already completed (prevent duplicate XP)
    const completedNodes = (user as any).completedAdventureNodes || [];
    if (completedNodes.includes(nodeId.toString())) {
      return res.status(400).json({
        success: false,
        message: 'Node already completed'
      });
    }

    // Update user XP
    await updateUserXP(userId, xp);
    
    // Update streak (adventure activities count as streak activities)
    // Streak is managed by frontend system only

    // Add to completed adventure nodes
    if (!(user as any).completedAdventureNodes) {
      (user as any).completedAdventureNodes = [];
    }
    (user as any).completedAdventureNodes.push(nodeId.toString());
    await user.save();

    // Check for badge unlocks
    const prevBadges = (user as any).badges || [];
    console.log('🔍 Adventure Controller - Previous badges:', prevBadges);
    await checkAndUnlockBadges(userId);

    // Get updated user data
    const updatedUser = await User.findById(userId);
    const newTotalXP = (updatedUser as any).totalXP;
    const newLevel = calculateLevel(newTotalXP);
    const updatedBadges = (updatedUser as any)?.badges || [];
    const badgesUnlocked = updatedBadges.filter((b: string) => !prevBadges.includes(b));
    
    console.log('🔍 Adventure Controller - Updated badges:', updatedBadges);
    console.log('🔍 Adventure Controller - Badges unlocked:', badgesUnlocked);

    logger.info(`Adventure node ${nodeId} completed by user ${(user as any).username}: +${xp} XP`);
    if (badgesUnlocked.length > 0) {
      logger.info(`🎉 Unlocked badges: ${badgesUnlocked.join(', ')}`);
    }

    return res.json({
      success: true,
      message: 'Adventure node completed successfully!',
      data: {
        nodeId,
        xpEarned: xp,
        totalXP: newTotalXP,
        level: newLevel,
        currentStreak: (updatedUser as any).currentStreak,
        completedNodes: (updatedUser as any).completedAdventureNodes || [],
        badgesUnlocked
      }
    });

  } catch (error) {
    logger.error('Adventure node completion error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getAdventureProgress = async (req: any, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const completedNodes = (user as any).completedAdventureNodes || [];

    return res.json({
      success: true,
      data: {
        completedNodes,
        totalXP: (user as any).totalXP,
        level: calculateLevel((user as any).totalXP)
      }
    });

  } catch (error) {
    logger.error('Get adventure progress error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
