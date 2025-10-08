import { Challenge } from '../models';
import logger from '../config/logger';

// Static challenges data from the Challenges page
const challengesPageData = [
  { 
    id: 1, 
    title: "Hello World Debug", 
    difficulty: "easy", 
    xp: 50, 
    completed: true, 
    description: "Fix the syntax error" 
  },
  { 
    id: 2, 
    title: "Array Reversal", 
    difficulty: "easy", 
    xp: 75, 
    completed: false, 
    description: "Reverse an array without built-in methods" 
  },
  { 
    id: 3, 
    title: "Palindrome Checker", 
    difficulty: "medium", 
    xp: 150, 
    completed: false, 
    description: "Check if a string is a palindrome" 
  },
  { 
    id: 4, 
    title: "Binary Search", 
    difficulty: "medium", 
    xp: 200, 
    completed: false, 
    description: "Implement binary search algorithm" 
  },
  { 
    id: 5, 
    title: "Dynamic Programming", 
    difficulty: "hard", 
    xp: 350, 
    completed: false, 
    description: "Solve the knapsack problem" 
  },
  { 
    id: 6, 
    title: "Tree Traversal", 
    difficulty: "hard", 
    xp: 400, 
    completed: false, 
    description: "Implement post-order traversal" 
  },
];

export const seedChallengesPageData = async () => {
  try {
    logger.info('🌱 Seeding challenges from Challenges page data...');
    
    let createdCount = 0;
    let updatedCount = 0;

    for (const challengeData of challengesPageData) {
      const challenge = {
        slug: `challenge-${challengeData.id}`,
        title: challengeData.title,
        description: challengeData.description,
        difficulty: challengeData.difficulty as 'easy' | 'medium' | 'hard',
        type: 'code' as const,
        xpReward: challengeData.xp,
        tags: [challengeData.difficulty, 'programming'],
        isDaily: false,
        isActive: true,
        content: {
          question: `Solve the challenge: ${challengeData.description}`,
          correctAnswer: `solution-${challengeData.id}`,
          hint: `Think about the ${challengeData.difficulty} level approach for this problem.`
        }
      };

      const existingChallenge = await Challenge.findOne({ slug: `challenge-${challengeData.id}` });
      
      if (existingChallenge) {
        await Challenge.findByIdAndUpdate(existingChallenge._id, challenge);
        updatedCount++;
        logger.info(`  🔄 Updated challenge: ${challengeData.title} (${challengeData.difficulty})`);
      } else {
        await Challenge.create(challenge);
        createdCount++;
        logger.info(`  ➕ Created challenge: ${challengeData.title} (${challengeData.difficulty})`);
      }
    }

    logger.info(`✅ Challenges page data seeding completed: ${createdCount} created, ${updatedCount} updated`);
    return { created: createdCount, updated: updatedCount };
  } catch (error) {
    logger.error('❌ Error seeding challenges page data:', error);
    throw error;
  }
};
