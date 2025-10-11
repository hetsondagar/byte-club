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
    key: 'challenge_master',
    type: 'badge',
    name: 'Challenge Master',
    description: 'Complete 2 challenges',
    xpReward: 100,
    icon: '🏆',
    unlocked: false,
    requirements: { challengesCompleted: 2 }
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
  },
  
  // ==================== ADVENTURE MAP BADGES ====================
  {
    key: 'gateway_opener',
    type: 'badge',
    name: 'Gateway Opener',
    description: 'Complete your first Adventure Map node',
    xpReward: 100,
    icon: '🚪',
    unlocked: false,
    requirements: { adventureNodesCompleted: 1 }
  },
  {
    key: 'path_finder',
    type: 'badge',
    name: 'Path Finder',
    description: 'Complete 10 Adventure Map nodes',
    xpReward: 250,
    icon: '🗺️',
    unlocked: false,
    requirements: { adventureNodesCompleted: 10 }
  },
  {
    key: 'map_explorer',
    type: 'badge',
    name: 'Map Explorer',
    description: 'Complete 25 Adventure Map nodes',
    xpReward: 500,
    icon: '🧭',
    unlocked: false,
    requirements: { adventureNodesCompleted: 25 }
  },
  {
    key: 'halfway_hero',
    type: 'badge',
    name: 'Halfway Hero',
    description: 'Complete 50 Adventure Map nodes',
    xpReward: 1000,
    icon: '⭐',
    unlocked: false,
    requirements: { adventureNodesCompleted: 50 }
  },
  {
    key: 'summit_conqueror',
    type: 'badge',
    name: 'Summit Conqueror',
    description: 'Complete 75 Adventure Map nodes',
    xpReward: 1500,
    icon: '🏔️',
    unlocked: false,
    requirements: { adventureNodesCompleted: 75 }
  },
  {
    key: 'legendary_explorer',
    type: 'badge',
    name: 'Legendary Explorer',
    description: 'Complete ALL 100 Adventure Map nodes!',
    xpReward: 5000,
    icon: '👑',
    unlocked: false,
    requirements: { adventureNodesCompleted: 100 }
  },
  
  // ==================== QUEST BADGES ====================
  {
    key: 'quest_beginner',
    type: 'badge',
    name: 'Quest Beginner',
    description: 'Complete your first quest mission',
    xpReward: 150,
    icon: '📜',
    unlocked: false,
    requirements: { questMissionsCompleted: 1 }
  },
  {
    key: 'mission_specialist',
    type: 'badge',
    name: 'Mission Specialist',
    description: 'Complete 5 quest missions',
    xpReward: 300,
    icon: '🎯',
    unlocked: false,
    requirements: { questMissionsCompleted: 5 }
  },
  {
    key: 'quest_master',
    type: 'badge',
    name: 'Quest Master',
    description: 'Complete an entire quest',
    xpReward: 500,
    icon: '🏅',
    unlocked: false,
    requirements: { questsCompleted: 1 }
  },
  {
    key: 'legendary_adventurer',
    type: 'badge',
    name: 'Legendary Adventurer',
    description: 'Complete all 10 quests',
    xpReward: 3000,
    icon: '🌟',
    unlocked: false,
    requirements: { questsCompleted: 10 }
  },
  
  // ==================== DSA CHALLENGE BADGES ====================
  {
    key: 'code_warrior',
    type: 'badge',
    name: 'Code Warrior',
    description: 'Complete your first DSA challenge',
    xpReward: 100,
    icon: '⚔️',
    unlocked: false,
    requirements: { dsaChallengesCompleted: 1 }
  },
  {
    key: 'algorithm_apprentice',
    type: 'badge',
    name: 'Algorithm Apprentice',
    description: 'Complete 10 DSA challenges',
    xpReward: 300,
    icon: '🧙',
    unlocked: false,
    requirements: { dsaChallengesCompleted: 10 }
  },
  {
    key: 'easy_mode_champion',
    type: 'badge',
    name: 'Easy Mode Champion',
    description: 'Complete all 33 Easy DSA challenges',
    xpReward: 1000,
    icon: '🥉',
    unlocked: false,
    requirements: { easyDSACompleted: 33 }
  },
  {
    key: 'medium_mastery',
    type: 'badge',
    name: 'Medium Mastery',
    description: 'Complete all 33 Medium DSA challenges',
    xpReward: 2000,
    icon: '🥈',
    unlocked: false,
    requirements: { mediumDSACompleted: 33 }
  },
  {
    key: 'hard_mode_legend',
    type: 'badge',
    name: 'Hard Mode Legend',
    description: 'Complete all 33 Hard DSA challenges',
    xpReward: 3000,
    icon: '🥇',
    unlocked: false,
    requirements: { hardDSACompleted: 33 }
  },
  {
    key: 'dsa_grandmaster',
    type: 'badge',
    name: 'DSA Grandmaster',
    description: 'Complete ALL 99 DSA challenges!',
    xpReward: 10000,
    icon: '💎',
    unlocked: false,
    requirements: { dsaChallengesCompleted: 99 }
  },
  
  // ==================== CODE HEIST BADGES ====================
  {
    key: 'heist_rookie',
    type: 'badge',
    name: 'Heist Rookie',
    description: 'Play your first Code Heist game',
    xpReward: 200,
    icon: '🎮',
    unlocked: false,
    requirements: { codeHeistGamesPlayed: 1 }
  },
  {
    key: 'master_thief',
    type: 'badge',
    name: 'Master Thief',
    description: 'Win a Code Heist game',
    xpReward: 500,
    icon: '🎭',
    unlocked: false,
    requirements: { codeHeistWins: 1 }
  },
  {
    key: 'algorithm_guardian',
    type: 'badge',
    name: 'Algorithm Guardian',
    description: 'Protect the Master Algorithm 5 times',
    xpReward: 750,
    icon: '🛡️',
    unlocked: false,
    requirements: { masterAlgorithmSaves: 5 }
  },
  {
    key: 'heist_champion',
    type: 'badge',
    name: 'Heist Champion',
    description: 'Win 10 Code Heist games',
    xpReward: 2000,
    icon: '👑',
    unlocked: false,
    requirements: { codeHeistWins: 10 }
  },
  
  // ==================== XP MILESTONE BADGES ====================
  {
    key: 'xp_novice',
    type: 'badge',
    name: 'XP Novice',
    description: 'Earn 1,000 total XP',
    xpReward: 100,
    icon: '💫',
    unlocked: false,
    requirements: { totalXP: 1000 }
  },
  {
    key: 'xp_warrior',
    type: 'badge',
    name: 'XP Warrior',
    description: 'Earn 5,000 total XP',
    xpReward: 500,
    icon: '⚡',
    unlocked: false,
    requirements: { totalXP: 5000 }
  },
  {
    key: 'xp_legend',
    type: 'badge',
    name: 'XP Legend',
    description: 'Earn 10,000 total XP',
    xpReward: 1000,
    icon: '🌠',
    unlocked: false,
    requirements: { totalXP: 10000 }
  },
  {
    key: 'xp_god',
    type: 'badge',
    name: 'XP God',
    description: 'Earn 25,000 total XP',
    xpReward: 2500,
    icon: '✨',
    unlocked: false,
    requirements: { totalXP: 25000 }
  },
  {
    key: 'ultimate_hacker',
    type: 'badge',
    name: 'Ultimate Hacker',
    description: 'Earn 50,000 total XP!',
    xpReward: 5000,
    icon: '🎆',
    unlocked: false,
    requirements: { totalXP: 50000 }
  },
  
  // ==================== STREAK BADGES ====================
  {
    key: 'committed_coder',
    type: 'badge',
    name: 'Committed Coder',
    description: 'Maintain a 7-day streak',
    xpReward: 200,
    icon: '📅',
    unlocked: false,
    requirements: { currentStreak: 7 }
  },
  {
    key: 'dedicated_developer',
    type: 'badge',
    name: 'Dedicated Developer',
    description: 'Maintain a 14-day streak',
    xpReward: 400,
    icon: '📆',
    unlocked: false,
    requirements: { currentStreak: 14 }
  },
  {
    key: 'unstoppable_force',
    type: 'badge',
    name: 'Unstoppable Force',
    description: 'Maintain a 60-day streak',
    xpReward: 2000,
    icon: '💥',
    unlocked: false,
    requirements: { currentStreak: 60 }
  },
  {
    key: 'eternal_grind',
    type: 'badge',
    name: 'Eternal Grind',
    description: 'Maintain a 100-day streak!',
    xpReward: 5000,
    icon: '♾️',
    unlocked: false,
    requirements: { currentStreak: 100 }
  },
  
  // ==================== TOPIC MASTERY BADGES ====================
  {
    key: 'array_master',
    type: 'badge',
    name: 'Array Master',
    description: 'Complete 20 array challenges',
    xpReward: 500,
    icon: '📊',
    unlocked: false,
    requirements: { arrayChallengesCompleted: 20 }
  },
  {
    key: 'string_sorcerer',
    type: 'badge',
    name: 'String Sorcerer',
    description: 'Complete 15 string challenges',
    xpReward: 500,
    icon: '📝',
    unlocked: false,
    requirements: { stringChallengesCompleted: 15 }
  },
  {
    key: 'tree_whisperer',
    type: 'badge',
    name: 'Tree Whisperer',
    description: 'Complete 15 tree challenges',
    xpReward: 600,
    icon: '🌳',
    unlocked: false,
    requirements: { treeChallengesCompleted: 15 }
  },
  {
    key: 'graph_guru',
    type: 'badge',
    name: 'Graph Guru',
    description: 'Complete 10 graph challenges',
    xpReward: 700,
    icon: '🕸️',
    unlocked: false,
    requirements: { graphChallengesCompleted: 10 }
  },
  {
    key: 'dp_dynamo',
    type: 'badge',
    name: 'DP Dynamo',
    description: 'Complete 15 dynamic programming challenges',
    xpReward: 800,
    icon: '🧩',
    unlocked: false,
    requirements: { dpChallengesCompleted: 15 }
  },
  {
    key: 'backtrack_boss',
    type: 'badge',
    name: 'Backtrack Boss',
    description: 'Complete 10 backtracking challenges',
    xpReward: 700,
    icon: '🔙',
    unlocked: false,
    requirements: { backtrackChallengesCompleted: 10 }
  },
  
  // ==================== SPECIAL ACHIEVEMENT BADGES ====================
  {
    key: 'early_bird',
    type: 'badge',
    name: 'Early Bird',
    description: 'Complete a challenge before 8 AM',
    xpReward: 300,
    icon: '🌅',
    unlocked: false,
    requirements: { earlyMorningChallenges: 1 }
  },
  {
    key: 'night_owl',
    type: 'badge',
    name: 'Night Owl',
    description: 'Complete a challenge after midnight',
    xpReward: 300,
    icon: '🦉',
    unlocked: false,
    requirements: { latNightChallenges: 1 }
  },
  {
    key: 'weekend_warrior',
    type: 'badge',
    name: 'Weekend Warrior',
    description: 'Complete 10 challenges on weekends',
    xpReward: 400,
    icon: '🎯',
    unlocked: false,
    requirements: { weekendChallenges: 10 }
  },
  {
    key: 'perfectionist',
    type: 'badge',
    name: 'Perfectionist',
    description: 'Submit a solution that passes all tests on first try 10 times',
    xpReward: 600,
    icon: '💯',
    unlocked: false,
    requirements: { firstTryPasses: 10 }
  },
  {
    key: 'comeback_king',
    type: 'badge',
    name: 'Comeback King',
    description: 'Solve a challenge after 5+ failed attempts',
    xpReward: 400,
    icon: '🦅',
    unlocked: false,
    requirements: { comebackSolves: 1 }
  },
  
  // ==================== DIFFICULTY BADGES ====================
  {
    key: 'easy_peasy',
    type: 'badge',
    name: 'Easy Peasy',
    description: 'Complete 5 Easy challenges',
    xpReward: 200,
    icon: '🟢',
    unlocked: false,
    requirements: { easyCompleted: 5 }
  },
  {
    key: 'medium_momentum',
    type: 'badge',
    name: 'Medium Momentum',
    description: 'Complete 5 Medium challenges',
    xpReward: 400,
    icon: '🟡',
    unlocked: false,
    requirements: { mediumCompleted: 5 }
  },
  {
    key: 'hard_hacker',
    type: 'badge',
    name: 'Hard Hacker',
    description: 'Complete your first Hard challenge',
    xpReward: 600,
    icon: '🔴',
    unlocked: false,
    requirements: { hardCompleted: 1 }
  },
  {
    key: 'impossible_mode',
    type: 'badge',
    name: 'Impossible Mode',
    description: 'Complete 10 Hard challenges',
    xpReward: 2000,
    icon: '💀',
    unlocked: false,
    requirements: { hardCompleted: 10 }
  },
  
  // ==================== SPEED BADGES ====================
  {
    key: 'lightning_fast',
    type: 'badge',
    name: 'Lightning Fast',
    description: 'Complete a challenge in under 2 minutes',
    xpReward: 300,
    icon: '⚡',
    unlocked: false,
    requirements: { speedSolves: 1 }
  },
  {
    key: 'speedrun_master',
    type: 'badge',
    name: 'Speedrun Master',
    description: 'Complete 10 challenges in under 3 minutes each',
    xpReward: 1000,
    icon: '🏃',
    unlocked: false,
    requirements: { speedSolves: 10 }
  },
  
  // ==================== LEVEL BADGES ====================
  {
    key: 'level_5_legend',
    type: 'badge',
    name: 'Level 5 Legend',
    description: 'Reach Level 5',
    xpReward: 250,
    icon: '5️⃣',
    unlocked: false,
    requirements: { currentLevel: 5 }
  },
  {
    key: 'level_10_titan',
    type: 'badge',
    name: 'Level 10 Titan',
    description: 'Reach Level 10',
    xpReward: 500,
    icon: '🔟',
    unlocked: false,
    requirements: { currentLevel: 10 }
  },
  {
    key: 'level_25_deity',
    type: 'badge',
    name: 'Level 25 Deity',
    description: 'Reach Level 25',
    xpReward: 1500,
    icon: '🎖️',
    unlocked: false,
    requirements: { currentLevel: 25 }
  },
  {
    key: 'level_50_immortal',
    type: 'badge',
    name: 'Level 50 Immortal',
    description: 'Reach the legendary Level 50!',
    xpReward: 5000,
    icon: '🏆',
    unlocked: false,
    requirements: { currentLevel: 50 }
  },
  
  // ==================== FUN & UNIQUE BADGES ====================
  {
    key: 'byte_collector',
    type: 'badge',
    name: 'Byte Collector',
    description: 'Complete challenges on 7 different days',
    xpReward: 350,
    icon: '💾',
    unlocked: false,
    requirements: { uniqueDaysActive: 7 }
  },
  {
    key: 'error_handler',
    type: 'badge',
    name: 'Error Handler',
    description: 'Successfully fix and submit after getting 10 errors',
    xpReward: 300,
    icon: '🚨',
    unlocked: false,
    requirements: { errorsHandled: 10 }
  },
  {
    key: 'bug_hunter',
    type: 'badge',
    name: 'Bug Hunter',
    description: 'Find and fix bugs in 20 code snippets',
    xpReward: 600,
    icon: '🐞',
    unlocked: false,
    requirements: { bugsFixed: 20 }
  },
  {
    key: 'optimization_expert',
    type: 'badge',
    name: 'Optimization Expert',
    description: 'Improve solution efficiency 5 times',
    xpReward: 800,
    icon: '📈',
    unlocked: false,
    requirements: { optimizations: 5 }
  },
  {
    key: 'clean_coder',
    type: 'badge',
    name: 'Clean Coder',
    description: 'Write readable, well-formatted code in 15 challenges',
    xpReward: 400,
    icon: '✨',
    unlocked: false,
    requirements: { cleanCodeSubmissions: 15 }
  },
  {
    key: 'memory_master',
    type: 'badge',
    name: 'Memory Master',
    description: 'Solve 10 challenges with optimal space complexity',
    xpReward: 700,
    icon: '🧠',
    unlocked: false,
    requirements: { optimalSpaceSolutions: 10 }
  },
  {
    key: 'time_traveler',
    type: 'badge',
    name: 'Time Traveler',
    description: 'Solve 10 challenges with optimal time complexity',
    xpReward: 700,
    icon: '⏱️',
    unlocked: false,
    requirements: { optimalTimeSolutions: 10 }
  },
  {
    key: 'polyglot_programmer',
    type: 'badge',
    name: 'Polyglot Programmer',
    description: 'Solve challenges in 3 different programming languages',
    xpReward: 1000,
    icon: '🌐',
    unlocked: false,
    requirements: { languagesUsed: 3 }
  },
  {
    key: 'test_case_crusher',
    type: 'badge',
    name: 'Test Case Crusher',
    description: 'Pass 100 total test cases',
    xpReward: 500,
    icon: '✅',
    unlocked: false,
    requirements: { testCasesPassed: 100 }
  },
  {
    key: 'marathon_runner',
    type: 'badge',
    name: 'Marathon Runner',
    description: 'Complete 20 challenges in a single day',
    xpReward: 1500,
    icon: '🏃‍♂️',
    unlocked: false,
    requirements: { singleDayChallenges: 20 }
  },
  
  // ==================== COMMUNITY BADGES ====================
  {
    key: 'early_adopter',
    type: 'badge',
    name: 'Early Adopter',
    description: 'One of the first 100 users on byte_club',
    xpReward: 1000,
    icon: '🚀',
    unlocked: false,
    requirements: { userNumber: 100 }
  },
  {
    key: 'founding_member',
    type: 'badge',
    name: 'Founding Member',
    description: 'Joined byte_club in its first week',
    xpReward: 2000,
    icon: '🎖️',
    unlocked: false,
    requirements: { joinedEarly: true }
  },
  
  // ==================== ULTIMATE BADGES ====================
  {
    key: 'byte_club_legend',
    type: 'badge',
    name: 'byte_club Legend',
    description: 'Complete 100 Adventure Nodes + 99 DSA Challenges + All 10 Quests',
    xpReward: 20000,
    icon: '🔱',
    unlocked: false,
    requirements: { adventureNodesCompleted: 100, dsaChallengesCompleted: 99, questsCompleted: 10 }
  },
  {
    key: 'the_chosen_one',
    type: 'badge',
    name: 'The Chosen One',
    description: 'Unlock every single badge in byte_club',
    xpReward: 50000,
    icon: '🌌',
    unlocked: false,
    requirements: { allBadgesUnlocked: true }
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
