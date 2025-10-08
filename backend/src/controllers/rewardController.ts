import { Request, Response } from 'express';
import { User, Meta } from '../models';
import logger from '../config/logger';

export const purchaseReward = async (req: any, res: Response) => {
  try {
    const { key } = req.params;
    const userId = req.user._id;

    // Find the reward
    const reward = await Meta.findOne({ key, type: 'reward' });
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    // Check if user already owns this reward
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.rewards.includes(key)) {
      return res.status(400).json({
        success: false,
        message: 'Reward already owned'
      });
    }

    // Check if user has enough XP
    if (user.totalXP < (reward.xpCost || 0)) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient XP'
      });
    }

    // Deduct XP and add reward
    user.totalXP -= reward.xpCost || 0;
    user.rewards.push(key);
    await user.save();

    logger.info(`User ${user.username} purchased reward: ${key}`);

    res.json({
      success: true,
      message: 'Reward purchased successfully',
      data: {
        reward: {
          key: reward.key,
          name: reward.name,
          description: reward.description,
          xpCost: reward.xpCost
        },
        remainingXP: user.totalXP
      }
    });
  } catch (error) {
    logger.error('Purchase reward error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
