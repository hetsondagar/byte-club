import { User } from '../models';
import logger from '../config/logger';

export const calculateXP = (difficulty: 'easy' | 'medium' | 'hard'): number => {
  const xpMap = {
    easy: 50,
    medium: 100,
    hard: 200
  };
  return xpMap[difficulty];
};

export const calculateLevel = (totalXP: number): number => {
  return Math.floor(totalXP / 500) + 1;
};

export const updateUserXP = async (userId: string, xpToAdd: number): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) return;

  const oldLevel = user.currentLevel;
  user.totalXP += xpToAdd;
  user.currentLevel = calculateLevel(user.totalXP);

  await user.save();

  if (user.currentLevel > oldLevel) {
    logger.info(`User ${user.username} leveled up to level ${user.currentLevel}`);
  }
};

export const updateStreak = async (userId: string): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) return;

  const now = new Date();
  const lastChallenge = user.lastChallengeDate;

  if (!lastChallenge) {
    // First challenge
    user.currentStreak = 1;
    user.lastChallengeDate = now;
  } else {
    const timeDiff = now.getTime() - lastChallenge.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff <= 48) {
      // Within 48 hours, increment streak
      user.currentStreak += 1;
    } else {
      // More than 48 hours, reset streak
      user.currentStreak = 1;
    }
    user.lastChallengeDate = now;
  }

  await user.save();
  logger.info(`User ${user.username} streak updated to ${user.currentStreak}`);
};
