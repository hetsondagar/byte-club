import { User, Meta, Challenge } from '../models';
import logger from '../config/logger';

export const checkAndUnlockBadges = async (userId: string): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) {
    logger.error('User not found for badge checking:', userId);
    return;
  }
  
  logger.info(`Checking badges for user ${(user as any).username}, completed challenges: ${(user as any).completedChallenges.length}`);

  const badgesToCheck = [
    // First challenge
    { key: 'first_steps', condition: () => (user as any).completedChallenges.length >= 1 },
    
    // Second challenge
    { key: 'challenge_master', condition: () => (user as any).completedChallenges.length >= 2 },
    
    // Challenge count badges
    { key: 'loop_lord', condition: () => (user as any).completedChallenges.length >= 10 },
    
    // Streak badges
    { key: 'streak_keeper', condition: () => (user as any).currentStreak >= 30 },
    
    // Syntax challenges badge
    { key: 'syntax_slayer', condition: async () => {
      const syntaxChallenges = await Challenge.countDocuments({ 
        tags: { $in: ['syntax'] }, 
        isActive: true 
      });
      const completedSyntax = await Challenge.countDocuments({
        slug: { $in: (user as any).completedChallenges },
        tags: { $in: ['syntax'] },
        isActive: true
      });
      return completedSyntax >= 1; // Award for completing first syntax challenge
    }},
    
    // XP badges
    { key: 'speed_demon', condition: () => (user as any).totalXP >= 2000 },
    
    // Difficulty mastery badges
    { key: 'array_ace', condition: async () => {
      const easyChallenges = await Challenge.countDocuments({ difficulty: 'easy', isActive: true });
      const completedEasy = await Challenge.countDocuments({
        slug: { $in: (user as any).completedChallenges },
        difficulty: 'easy',
        isActive: true
      });
      return completedEasy >= easyChallenges && easyChallenges > 0;
    }},
    
    { key: 'function_fury', condition: async () => {
      const mediumChallenges = await Challenge.countDocuments({ difficulty: 'medium', isActive: true });
      const completedMedium = await Challenge.countDocuments({
        slug: { $in: (user as any).completedChallenges },
        difficulty: 'medium',
        isActive: true
      });
      return completedMedium >= mediumChallenges && mediumChallenges > 0;
    }},
    
    { key: 'recursion_master', condition: async () => {
      const hardChallenges = await Challenge.countDocuments({ difficulty: 'hard', isActive: true });
      const completedHard = await Challenge.countDocuments({
        slug: { $in: (user as any).completedChallenges },
        difficulty: 'hard',
        isActive: true
      });
      return completedHard >= hardChallenges && hardChallenges > 0;
    }}
  ];

  for (const badge of badgesToCheck) {
    if ((user as any).badges.includes(badge.key)) {
      logger.info(`User ${(user as any).username} already has badge: ${badge.key}`);
      continue; // Already has badge
    }

    const conditionMet = await badge.condition();
    logger.info(`Badge ${badge.key} condition met: ${conditionMet}`);
    
    if (conditionMet) {
      // Check if badge exists in meta
      const badgeMeta = await Meta.findOne({ key: badge.key, type: 'badge' });
      logger.info(`Badge meta found for ${badge.key}:`, !!badgeMeta);
      
      if (badgeMeta) {
        (user as any).badges.push(badge.key);
        
        // Award XP for badge unlock
        if (badgeMeta.xpReward && badgeMeta.xpReward > 0) {
          (user as any).totalXP += badgeMeta.xpReward;
          logger.info(`Awarded ${badgeMeta.xpReward} XP for badge: ${badge.key}`);
        }
        
        await user.save();
        logger.info(`Badge unlocked: ${badge.key} for user ${(user as any).username}`);
      } else {
        logger.warn(`Badge meta not found for: ${badge.key}`);
      }
    }
  }
};
