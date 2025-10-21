import { User, Meta, Challenge, Attempt } from '../models';
import mongoose from 'mongoose';
import logger from '../config/logger';
import { updateUserXP } from './xp';

export const checkAndUnlockBadges = async (userId: string): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) {
    logger.error('User not found for badge checking:', userId);
    return;
  }
  
  logger.info(`Checking badges for user ${(user as any).username}, completed challenges: ${(user as any).completedChallenges.length}`);
  
  // IMPORTANT: Streak badges are now managed by the frontend ONLY
  // The backend should NOT unlock streak badges - they are handled in the frontend
  // This prevents badges from unlocking when streaks aren't actually complete
  logger.info(`Note: Streak badges are managed by frontend system only - backend will not unlock them`);

  const badgesToCheck = [
    // ==================== BASIC PROGRESSION BADGES ====================
    { key: 'first_steps', condition: () => (user as any).completedChallenges.length >= 1 },
    { key: 'challenge_master', condition: () => (user as any).completedChallenges.length >= 5 },
    { key: 'coding_warrior', condition: () => (user as any).completedChallenges.length >= 15 },
    { key: 'algorithm_legend', condition: () => (user as any).completedChallenges.length >= 30 },
    
    // ==================== STREAK BADGES (MANAGED BY FRONTEND ONLY) ====================
    // These badges are handled by the frontend streak system to ensure accuracy
    // Backend will not unlock streak badges to prevent premature unlocking
    
    // ==================== DIFFICULTY MASTERY BADGES ====================
    { key: 'easy_ace', condition: async () => {
      const completedEasy = await Challenge.countDocuments({
        slug: { $in: (user as any).completedChallenges },
        difficulty: 'easy',
        isActive: true
      });
      return completedEasy >= 5;
    }},
    
    { key: 'medium_maestro', condition: async () => {
      const completedMedium = await Challenge.countDocuments({
        slug: { $in: (user as any).completedChallenges },
        difficulty: 'medium',
        isActive: true
      });
      return completedMedium >= 10;
    }},
    
    { key: 'hard_hero', condition: async () => {
      const completedHard = await Challenge.countDocuments({
        slug: { $in: (user as any).completedChallenges },
        difficulty: 'hard',
        isActive: true
      });
      return completedHard >= 5;
    }},
    
    { key: 'very_hard_virtuoso', condition: async () => {
      const completedVeryHard = await Challenge.countDocuments({
        slug: { $in: (user as any).completedChallenges },
        difficulty: 'very_hard',
        isActive: true
      });
      return completedVeryHard >= 3;
    }},
    
    // ==================== TOPIC MASTERY BADGES ====================
    { key: 'array_architect', condition: async () => {
      const completedArray = await Challenge.countDocuments({
        slug: { $in: (user as any).completedChallenges },
        tags: { $in: ['array', 'arrays'] },
        isActive: true
      });
      return completedArray >= 5;
    }},
    
    { key: 'string_sorcerer', condition: async () => {
      const completedString = await Challenge.countDocuments({
        slug: { $in: (user as any).completedChallenges },
        tags: { $in: ['string', 'strings'] },
        isActive: true
      });
      return completedString >= 5;
    }},
    
    { key: 'graph_guru', condition: async () => {
      const completedGraph = await Challenge.countDocuments({
        slug: { $in: (user as any).completedChallenges },
        tags: { $in: ['graph', 'graphs', 'cycle-detection'] },
        isActive: true
      });
      return completedGraph >= 3;
    }},
    
    { key: 'crypto_crusader', condition: async () => {
      const completedCrypto = await Challenge.countDocuments({
        slug: { $in: (user as any).completedChallenges },
        tags: { $in: ['cryptography', 'encryption', 'quantum'] },
        isActive: true
      });
      return completedCrypto >= 3;
    }},
    
    { key: 'dsa_destroyer', condition: async () => {
      const completedDSA = await Challenge.countDocuments({
        slug: { $in: (user as any).completedChallenges },
        tags: { $in: ['DSA', 'data-structures', 'algorithms'] },
        isActive: true
      });
      return completedDSA >= 10;
    }},
    
    // ==================== QUEST COMPLETION BADGES ====================
    { key: 'quantum_vault_breaker', condition: async () => {
      // Check if user completed the Quantum Vault quest (quest-1)
      const QuestProgress = mongoose.model('QuestProgress');
      const quantumProgress = await QuestProgress.findOne({ 
        userId: userId, 
        questId: 'quest-1',
        isCompleted: true 
      });
      return !!quantumProgress;
    }},
    
    { key: 'quest_completer', condition: async () => {
      // Check if user completed any full quest
      const QuestProgress = mongoose.model('QuestProgress');
      const completedQuests = await QuestProgress.find({ 
        userId: userId, 
        isCompleted: true 
      });
      return completedQuests.length >= 1;
    }},
    
    // ==================== ADVENTURE MAP BADGES ====================
    { key: 'adventure_explorer', condition: () => (user as any).completedAdventureNodes.length >= 5 },
    { key: 'adventure_master', condition: () => (user as any).completedAdventureNodes.length >= 20 },
    { key: 'adventure_legend', condition: () => (user as any).completedAdventureNodes.length >= 50 },
    
    // ==================== SPEED AND EFFICIENCY BADGES ====================
    { key: 'speed_demon', condition: async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentAttempts = await Attempt.find({
        userId: userId,
        isCorrect: true,
        completionTimeMs: { $lte: 5 * 60 * 1000 }, // Under 5 minutes
        createdAt: { $gte: fiveMinutesAgo }
      }).sort({ createdAt: -1 }).limit(5);
      
      return recentAttempts.length >= 5;
    }},
    
    { key: 'perfectionist', condition: async () => {
      // Complete 10 challenges with 100% accuracy (no failed attempts)
      const perfectChallenges = await Attempt.aggregate([
        {
          $match: {
            userId: userId,
            isCorrect: true
          }
        },
        {
          $group: {
            _id: '$challengeSlug',
            totalAttempts: { $sum: 1 },
            correctAttempts: { $sum: { $cond: ['$isCorrect', 1, 0] } }
          }
        },
        {
          $match: {
            totalAttempts: 1, // Only one attempt (perfect)
            correctAttempts: 1
          }
        }
      ]);
      
      return perfectChallenges.length >= 10;
    }},
    
    // ==================== XP MILESTONE BADGES ====================
    { key: 'xp_novice', condition: () => (user as any).totalXP >= 12000 },
    { key: 'xp_warrior', condition: () => (user as any).totalXP >= 25000 },
    { key: 'xp_legend', condition: () => (user as any).totalXP >= 50000 },
    { key: 'xp_god', condition: () => (user as any).totalXP >= 100000 }
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
        
        // Award XP for badge unlock using updateUserXP to ensure level is recalculated
        if ((badgeMeta as any).xpReward && (badgeMeta as any).xpReward > 0) {
          await updateUserXP(userId, (badgeMeta as any).xpReward);
          logger.info(`Awarded ${(badgeMeta as any).xpReward} XP for badge: ${badge.key}`);
        }
        
        await user.save();
        logger.info(`Badge unlocked: ${badge.key} for user ${(user as any).username}`);
      } else {
        logger.warn(`Badge meta not found for: ${badge.key}`);
      }
    }
  }
};
