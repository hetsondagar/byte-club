import { Meta } from '../models';
import logger from '../config/logger';

// Frontend static achievements data - Updated to match actual challenges and quests
export const frontendAchievementsData = [
  // ==================== BASIC PROGRESSION BADGES ====================
  {
    key: 'first_steps',
    type: 'badge',
    name: 'First Steps',
    description: 'Complete your first challenge',
    xpReward: 50,
    icon: '🎯',
    unlocked: false,
    requirements: { challengesCompleted: 1 }
  },
  {
    key: 'challenge_master',
    type: 'badge',
    name: 'Challenge Master',
    description: 'Complete 5 challenges',
    xpReward: 150,
    icon: '🏆',
    unlocked: false,
    requirements: { challengesCompleted: 5 }
  },
  {
    key: 'coding_warrior',
    type: 'badge',
    name: 'Coding Warrior',
    description: 'Complete 15 challenges',
    xpReward: 300,
    icon: '⚔️',
    unlocked: false,
    requirements: { challengesCompleted: 15 }
  },
  {
    key: 'algorithm_legend',
    type: 'badge',
    name: 'Algorithm Legend',
    description: 'Complete 30 challenges',
    xpReward: 500,
    icon: '👑',
    unlocked: false,
    requirements: { challengesCompleted: 30 }
  },
  
  // ==================== STREAK BADGES ====================
  {
    key: 'daily_coder',
    type: 'badge',
    name: 'Daily Coder',
    description: 'Maintain a 2-day streak',
    xpReward: 100,
    icon: '📅',
    unlocked: false,
    requirements: { currentStreak: 2 }
  },
  {
    key: 'week_warrior',
    type: 'badge',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    xpReward: 200,
    icon: '🗓️',
    unlocked: false,
    requirements: { currentStreak: 7 }
  },
  {
    key: 'month_master',
    type: 'badge',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    xpReward: 500,
    icon: '📆',
    unlocked: false,
    requirements: { currentStreak: 30 }
  },
  {
    key: 'streak_legend',
    type: 'badge',
    name: 'Streak Legend',
    description: 'Maintain a 100-day streak',
    xpReward: 1000,
    icon: '🔥',
    unlocked: false,
    requirements: { currentStreak: 100 }
  },
  
  // ==================== DIFFICULTY MASTERY BADGES ====================
  {
    key: 'easy_ace',
    type: 'badge',
    name: 'Easy Ace',
    description: 'Complete 5 easy challenges',
    xpReward: 150,
    icon: '🟢',
    unlocked: false,
    requirements: { easyChallengesCompleted: 5 }
  },
  {
    key: 'medium_maestro',
    type: 'badge',
    name: 'Medium Maestro',
    description: 'Complete 10 medium challenges',
    xpReward: 300,
    icon: '🟡',
    unlocked: false,
    requirements: { mediumChallengesCompleted: 10 }
  },
  {
    key: 'hard_hero',
    type: 'badge',
    name: 'Hard Hero',
    description: 'Complete 5 hard challenges',
    xpReward: 400,
    icon: '🟠',
    unlocked: false,
    requirements: { hardChallengesCompleted: 5 }
  },
  {
    key: 'very_hard_virtuoso',
    type: 'badge',
    name: 'Very Hard Virtuoso',
    description: 'Complete 3 very hard challenges',
    xpReward: 600,
    icon: '🔴',
    unlocked: false,
    requirements: { veryHardChallengesCompleted: 3 }
  },
  
  // ==================== TOPIC MASTERY BADGES ====================
  {
    key: 'array_architect',
    type: 'badge',
    name: 'Array Architect',
    description: 'Master 5 array challenges',
    xpReward: 250,
    icon: '📊',
    unlocked: false,
    requirements: { arrayChallengesCompleted: 5 }
  },
  {
    key: 'string_sorcerer',
    type: 'badge',
    name: 'String Sorcerer',
    description: 'Master 5 string challenges',
    xpReward: 250,
    icon: '🔤',
    unlocked: false,
    requirements: { stringChallengesCompleted: 5 }
  },
  {
    key: 'graph_guru',
    type: 'badge',
    name: 'Graph Guru',
    description: 'Master 3 graph challenges',
    xpReward: 400,
    icon: '🕸️',
    unlocked: false,
    requirements: { graphChallengesCompleted: 3 }
  },
  {
    key: 'crypto_crusader',
    type: 'badge',
    name: 'Crypto Crusader',
    description: 'Master 3 cryptography challenges',
    xpReward: 500,
    icon: '🔐',
    unlocked: false,
    requirements: { cryptoChallengesCompleted: 3 }
  },
  {
    key: 'dsa_destroyer',
    type: 'badge',
    name: 'DSA Destroyer',
    description: 'Master 10 DSA challenges',
    xpReward: 600,
    icon: '💥',
    unlocked: false,
    requirements: { dsaChallengesCompleted: 10 }
  },
  
  // ==================== QUEST COMPLETION BADGES ====================
  {
    key: 'quantum_vault_breaker',
    type: 'badge',
    name: 'Quantum Vault Breaker',
    description: 'Complete the Quantum Vault quest',
    xpReward: 800,
    icon: '⚛️',
    unlocked: false,
    requirements: { quantumVaultCompleted: true }
  },
  {
    key: 'quest_completer',
    type: 'badge',
    name: 'Quest Completer',
    description: 'Complete any full quest',
    xpReward: 600,
    icon: '🗝️',
    unlocked: false,
    requirements: { questCompleted: true }
  },
  
  // ==================== ADVENTURE MAP BADGES ====================
  {
    key: 'adventure_explorer',
    type: 'badge',
    name: 'Adventure Explorer',
    description: 'Complete 5 adventure nodes',
    xpReward: 200,
    icon: '🗺️',
    unlocked: false,
    requirements: { adventureNodesCompleted: 5 }
  },
  {
    key: 'adventure_master',
    type: 'badge',
    name: 'Adventure Master',
    description: 'Complete 20 adventure nodes',
    xpReward: 400,
    icon: '🏔️',
    unlocked: false,
    requirements: { adventureNodesCompleted: 20 }
  },
  {
    key: 'adventure_legend',
    type: 'badge',
    name: 'Adventure Legend',
    description: 'Complete 50 adventure nodes',
    xpReward: 800,
    icon: '🌟',
    unlocked: false,
    requirements: { adventureNodesCompleted: 50 }
  },
  
  // ==================== SPEED AND EFFICIENCY BADGES ====================
  {
    key: 'speed_demon',
    type: 'badge',
    name: 'Speed Demon',
    description: 'Complete 5 challenges in under 5 minutes',
    xpReward: 400,
    icon: '⚡',
    unlocked: false,
    requirements: { fastChallengesCompleted: 5 }
  },
  {
    key: 'perfectionist',
    type: 'badge',
    name: 'Perfectionist',
    description: 'Complete 10 challenges perfectly (first try)',
    xpReward: 600,
    icon: '💎',
    unlocked: false,
    requirements: { perfectChallengesCompleted: 10 }
  },
  
  // ==================== XP MILESTONE BADGES ====================
  {
    key: 'xp_novice',
    type: 'badge',
    name: 'XP Novice',
    description: 'Earn 12,000 total XP',
    xpReward: 200,
    icon: '💫',
    unlocked: false,
    requirements: { totalXP: 12000 }
  },
  {
    key: 'xp_warrior',
    type: 'badge',
    name: 'XP Warrior',
    description: 'Earn 25,000 total XP',
    xpReward: 500,
    icon: '⚔️',
    unlocked: false,
    requirements: { totalXP: 25000 }
  },
  {
    key: 'xp_legend',
    type: 'badge',
    name: 'XP Legend',
    description: 'Earn 50,000 total XP',
    xpReward: 1000,
    icon: '🌠',
    unlocked: false,
    requirements: { totalXP: 50000 }
  },
  {
    key: 'xp_god',
    type: 'badge',
    name: 'XP God',
    description: 'Earn 100,000 total XP',
    xpReward: 2500,
    icon: '✨',
    unlocked: false,
    requirements: { totalXP: 100000 }
  }
];

export const seedFrontendAchievements = async () => {
  try {
    logger.info('🏆 Seeding achievements from frontend static data...');
    
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const achievement of frontendAchievementsData) {
      const existing = await Meta.findOne({ key: achievement.key, type: achievement.type });
      
      if (existing) {
        // Update existing achievement
        await Meta.updateOne(
          { key: achievement.key, type: achievement.type },
          {
            name: achievement.name,
            description: achievement.description,
            xpReward: achievement.xpReward,
            icon: achievement.icon
          }
        );
        updatedCount++;
        logger.info(`✅ Updated achievement: ${achievement.name}`);
      } else {
        // Create new achievement
        await Meta.create({
          key: achievement.key,
          type: achievement.type,
          name: achievement.name,
          description: achievement.description,
          xpReward: achievement.xpReward,
          icon: achievement.icon
        });
        createdCount++;
        logger.info(`🆕 Created achievement: ${achievement.name}`);
      }
    }
    
    logger.info(`✅ Frontend achievements seeding completed: ${createdCount} created, ${updatedCount} updated`);
    return { created: createdCount, updated: updatedCount };
  } catch (error) {
    logger.error('❌ Error seeding frontend achievements:', error);
    throw error;
  }
};