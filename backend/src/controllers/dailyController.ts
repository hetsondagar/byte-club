import { Request, Response } from 'express';
import { Challenge } from '../models';
import logger from '../config/logger';

export const getDailyChallenge = async (req: Request, res: Response) => {
  try {
    // Get today's date as a string to ensure consistency
    const today = new Date().toISOString().split('T')[0];
    
    // Find a random daily challenge
    const dailyChallenges = await Challenge.find({ 
      isDaily: true, 
      isActive: true 
    });

    if (dailyChallenges.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No daily challenges available'
      });
    }

    // Select a random daily challenge
    const randomIndex = Math.floor(Math.random() * dailyChallenges.length);
    const dailyChallenge = dailyChallenges[randomIndex];

    // Remove correct answer from response
    const challengeData = {
      ...dailyChallenge.toObject(),
      content: {
        ...dailyChallenge.content,
        correctAnswer: undefined
      }
    };

    logger.info(`Daily challenge selected: ${dailyChallenge.slug}`);

    res.json({
      success: true,
      message: 'Daily challenge retrieved successfully',
      data: {
        challenge: challengeData,
        isNewDay: true // Always true for now, could be enhanced to track per user
      }
    });
  } catch (error) {
    logger.error('Get daily challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
