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

// Progressive XP thresholds matching frontend
function roundToNearest50(value: number): number {
  return Math.round(value / 50) * 50;
}

function buildXpThresholds(maxLevels: number = 100): number[] {
  const thresholds: number[] = [];
  // Raised thresholds for a more gamified curve (dashboard starts at 5000)
  thresholds[0] = 5000; // Level 1 -> 2
  thresholds[1] = roundToNearest50(thresholds[0] * 1.25); // ~3750
  thresholds[2] = roundToNearest50(thresholds[1] * 1.25); // ~4688 -> 4700
  for (let i = 3; i < maxLevels; i++) {
    const next = roundToNearest50(thresholds[i - 1] * 1.25);
    thresholds[i] = Math.max(thresholds[i - 1] + 50, next);
  }
  return thresholds;
}

const DEFAULT_THRESHOLDS = buildXpThresholds(200);

export const calculateLevel = (totalXP: number): number => {
  let level = 1;
  let remaining = Math.max(0, Math.floor(totalXP || 0));
  let idx = 0;

  while (idx < DEFAULT_THRESHOLDS.length && remaining >= DEFAULT_THRESHOLDS[idx]) {
    remaining -= DEFAULT_THRESHOLDS[idx];
    level += 1;
    idx += 1;
  }

  return level;
};

export const updateUserXP = async (userId: string, xpToAdd: number): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) return;

  const userDoc = user as any;
  const oldLevel = userDoc.currentLevel;
  userDoc.totalXP += xpToAdd;
  userDoc.currentLevel = calculateLevel(userDoc.totalXP);

  await userDoc.save();

  if (userDoc.currentLevel > oldLevel) {
    logger.info(`User ${userDoc.username} leveled up to level ${userDoc.currentLevel}`);
  }
};

// REMOVED: Backend streak system - using frontend streak system only
// The frontend manages streaks based on daily activity, not per-challenge
