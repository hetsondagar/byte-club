import { Request, Response } from 'express';
import { Challenge, Attempt, User } from '../models';
import { calculateXP, updateUserXP, updateStreak } from '../utils/xp';
import { checkAndUnlockBadges } from '../utils/badges';
import { executeCode } from '../utils/codeExecution';
import logger from '../config/logger';

export const getChallenges = async (req: Request, res: Response) => {
  try {
    const { difficulty, type, tags, isDaily } = req.query;
    
    const filter: any = { isActive: true };
    
    if (difficulty) filter.difficulty = difficulty;
    if (type) filter.type = type;
    if (tags) filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (isDaily !== undefined) filter.isDaily = isDaily === 'true';

    const challenges = await Challenge.find(filter)
      .select('-content.correctAnswer')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      message: 'Challenges retrieved successfully',
      data: { challenges }
    });
  } catch (error) {
    logger.error('Get challenges error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getChallenge = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const challenge = await Challenge.findOne({ slug, isActive: true });
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Remove correct answer from response
    const challengeData = {
      ...challenge.toObject(),
      content: {
        ...challenge.content,
        correctAnswer: undefined
      }
    };

    res.json({
      success: true,
      message: 'Challenge retrieved successfully',
      data: { challenge: challengeData }
    });
  } catch (error) {
    logger.error('Get challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const submitChallenge = async (req: any, res: Response) => {
  try {
    const { slug } = req.params;
    const { answer } = req.body;
    const userId = req.user._id;

    const challenge = await Challenge.findOne({ slug, isActive: true });
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Check if user already completed this challenge
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.completedChallenges.includes(slug)) {
      return res.status(400).json({
        success: false,
        message: 'Challenge already completed'
      });
    }

    let isCorrect = false;
    let xpEarned = 0;
    let runResults: any[] | undefined;

    // Check answer based on challenge type
    if (challenge.type === 'code') {
      const testCases = Array.isArray((challenge as any).content?.testCases) ? (challenge as any).content.testCases : [];
      const result = executeCode(answer as string, testCases);
      isCorrect = result.success;
      runResults = result.results;
    } else {
      // For MCQ and true/false
      isCorrect = answer === challenge.content.correctAnswer;
    }

    if (isCorrect) {
      xpEarned = calculateXP(challenge.difficulty);
      
      // Update user XP and level
      await updateUserXP(userId, xpEarned);
      
      // Update streak
      await updateStreak(userId);
      
      // Add to completed challenges
      user.completedChallenges.push(slug);
      await user.save();
      
      // Check for badge unlocks
      await checkAndUnlockBadges(userId);
      
      // Add streak bonus if applicable
      if (user.currentStreak >= 5) {
        const streakBonus = 20;
        await updateUserXP(userId, streakBonus);
        xpEarned += streakBonus;
      }
    }

    // Record attempt
    const attempt = new Attempt({
      userId,
      challengeSlug: slug,
      isCorrect,
      xpEarned
    });
    await attempt.save();

    logger.info(`Challenge submission: ${slug} by user ${user.username}, correct: ${isCorrect}`);

    res.json({
      success: true,
      message: isCorrect ? 'Challenge completed successfully!' : 'Incorrect answer',
      data: {
        isCorrect,
        xpEarned,
        streak: user.currentStreak,
        totalXP: user.totalXP + (isCorrect ? xpEarned : 0),
        runResults
      }
    });
  } catch (error) {
    logger.error('Submit challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const runCodeForChallenge = async (req: any, res: Response) => {
  try {
    const { slug } = req.params;
    const { code } = req.body as { code: string };

    const challenge = await Challenge.findOne({ slug, isActive: true });
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    if (challenge.type !== 'code') {
      return res.status(400).json({ success: false, message: 'Challenge is not a code challenge' });
    }

    const testCases = Array.isArray((challenge as any).content?.testCases) ? (challenge as any).content.testCases : [];
    const result = executeCode(code, testCases);

    return res.json({
      success: true,
      message: 'Code executed',
      data: result
    });
  } catch (error) {
    logger.error('Run code error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const runGenericCode = async (req: Request, res: Response) => {
  try {
    const { code, testCases = [] } = req.body as any;
    const result = executeCode(code, testCases);
    return res.json({ success: true, message: 'Code executed', data: result });
  } catch (error) {
    logger.error('Run generic code error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
