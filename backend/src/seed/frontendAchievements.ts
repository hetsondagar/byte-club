import { Meta } from '../models';
import logger from '../config/logger';

// Frontend static achievements data from Achievements.tsx
export const frontendAchievementsData = [
  {
    key: 'first_steps',
    type: 'badge',
    name: 'First Steps',
    description: 'Complete your first challenge',
    xpReward: 50,
    icon: '🎯',
    unlocked: true,
    requirements: { challengesCompleted: 1 }
  },
  {
    key: 'loop_lord',
    type: 'badge',
    name: 'Loop Lord',
    description: 'Master 10 loop challenges',
    xpReward: 200,
    icon: '🔄',
    unlocked: true,
    requirements: { loopChallengesCompleted: 10 }
  },
  {
    key: 'syntax_slayer',
    type: 'badge',
    name: 'Syntax Slayer',
    description: 'Fix 25 syntax errors',
    xpReward: 300,
    icon: '⚔️',
    unlocked: true,
    requirements: { syntaxErrorsFixed: 25 }
  },
  {
    key: 'speed_demon',
    type: 'badge',
    name: 'Speed Demon',
    description: 'Complete 5 challenges in under 5 minutes',
    xpReward: 400,
    icon: '⚡',
    unlocked: true,
    requirements: { fastChallengesCompleted: 5 }
  },
  {
    key: 'array_ace',
    type: 'badge',
    name: 'Array Ace',
    description: 'Master all array challenges',
    xpReward: 500,
    icon: '📊',
    unlocked: false,
    requirements: { arrayChallengesCompleted: 15 },
    progress: { current: 8, total: 15 }
  },
  {
    key: 'function_fury',
    type: 'badge',
    name: 'Function Fury',
    description: 'Write 50 functions',
    xpReward: 600,
    icon: '⚙️',
    unlocked: false,
    requirements: { functionsWritten: 50 },
    progress: { current: 32, total: 50 }
  },
  {
    key: 'recursion_master',
    type: 'badge',
    name: 'Recursion Master',
    description: 'Solve 10 recursion problems',
    xpReward: 700,
    icon: '♾️',
    unlocked: false,
    requirements: { recursionProblemsSolved: 10 },
    progress: { current: 3, total: 10 }
  },
  {
    key: 'bug_exterminator',
    type: 'badge',
    name: 'Bug Exterminator',
    description: 'Debug 100 code snippets',
    xpReward: 800,
    icon: '🐛',
    unlocked: false,
    requirements: { bugsFixed: 100 },
    progress: { current: 45, total: 100 }
  },
  {
    key: 'streak_keeper',
    type: 'badge',
    name: 'Streak Keeper',
    description: 'Maintain a 30-day streak',
    xpReward: 1000,
    icon: '🔥',
    unlocked: false,
    requirements: { streakDays: 30 },
    progress: { current: 7, total: 30 }
  }
];

export const seedFrontendAchievements = async () => {
  try {
    logger.info('🏆 Seeding achievements from frontend static data...');
    
    let createdCount = 0;
    let updatedCount = 0;

    for (const achievement of frontendAchievementsData) {
      const existingAchievement = await Meta.findOne({ key: achievement.key });
      
      if (existingAchievement) {
        await Meta.findByIdAndUpdate(existingAchievement._id, achievement);
        updatedCount++;
        logger.info(`  🔄 Updated achievement: ${achievement.key} (${achievement.name})`);
      } else {
        await Meta.create(achievement);
        createdCount++;
        logger.info(`  ➕ Created achievement: ${achievement.key} (${achievement.name})`);
      }
    }

    logger.info(`✅ Frontend achievements seeding completed: ${createdCount} created, ${updatedCount} updated`);
    return { created: createdCount, updated: updatedCount };
  } catch (error) {
    logger.error('❌ Error seeding frontend achievements:', error);
    throw error;
  }
};
