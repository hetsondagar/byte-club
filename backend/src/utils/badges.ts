import { User, Meta, Challenge } from '../models';
import logger from '../config/logger';

export const checkAndUnlockBadges = async (userId: string): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) return;

  const badgesToCheck = [
    // First challenge
    { key: 'first_solve', condition: () => user.completedChallenges.length >= 1 },
    
    // Challenge count badges
    { key: 'five_solve', condition: () => user.completedChallenges.length >= 5 },
    { key: 'ten_solve', condition: () => user.completedChallenges.length >= 10 },
    
    // Streak badges
    { key: 'streak_5', condition: () => user.currentStreak >= 5 },
    { key: 'streak_10', condition: () => user.currentStreak >= 10 },
    
    // XP badges
    { key: 'xp_1000', condition: () => user.totalXP >= 1000 },
    { key: 'xp_5000', condition: () => user.totalXP >= 5000 },
    
    // Difficulty mastery badges
    { key: 'easy_master', condition: async () => {
      const easyChallenges = await Challenge.countDocuments({ difficulty: 'easy', isActive: true });
      const completedEasy = await Challenge.countDocuments({
        slug: { $in: user.completedChallenges },
        difficulty: 'easy',
        isActive: true
      });
      return completedEasy >= easyChallenges && easyChallenges > 0;
    }},
    
    { key: 'medium_master', condition: async () => {
      const mediumChallenges = await Challenge.countDocuments({ difficulty: 'medium', isActive: true });
      const completedMedium = await Challenge.countDocuments({
        slug: { $in: user.completedChallenges },
        difficulty: 'medium',
        isActive: true
      });
      return completedMedium >= mediumChallenges && mediumChallenges > 0;
    }},
    
    { key: 'hard_master', condition: async () => {
      const hardChallenges = await Challenge.countDocuments({ difficulty: 'hard', isActive: true });
      const completedHard = await Challenge.countDocuments({
        slug: { $in: user.completedChallenges },
        difficulty: 'hard',
        isActive: true
      });
      return completedHard >= hardChallenges && hardChallenges > 0;
    }}
  ];

  for (const badge of badgesToCheck) {
    if (user.badges.includes(badge.key)) continue; // Already has badge

    const conditionMet = await badge.condition();
    if (conditionMet) {
      // Check if badge exists in meta
      const badgeMeta = await Meta.findOne({ key: badge.key, type: 'badge' });
      if (badgeMeta) {
        user.badges.push(badge.key);
        await user.save();
        logger.info(`Badge unlocked: ${badge.key} for user ${user.username}`);
      }
    }
  }
};
