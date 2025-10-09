import { Challenge } from '../models';
import logger from '../config/logger';

// Enriched challenges data for the Challenges page (code challenges with test cases)
const challengesPageData = [
  { 
    id: 1, 
    title: "Hello World Debug", 
    difficulty: "easy", 
    xp: 50, 
    completed: true, 
    description: "Fix the syntax error in the function so it returns 'Hello, Byte Club!'",
    question: "Fix the syntax error so solution() returns the string 'Hello, Byte Club!'",
    starterCode: `function solution() {\n  // Fix the syntax error below\n  return \"Hello, World!\"\n}`,
    testCases: [
      { input: null, expected: "Hello, Byte Club!" }
    ]
  },
  { 
    id: 2, 
    title: "Array Reversal", 
    difficulty: "easy", 
    xp: 75, 
    completed: false, 
    description: "Reverse an array without built-in reverse()",
    question: "Implement solution(arr) that returns the array reversed without using reverse().",
    starterCode: `function solution(arr) {\n  // Write your code here\n  // Return a new array with elements in reverse order\n  // DO NOT use arr.reverse() or any built-in reverse method\n}`,
    testCases: [
      { input: [1,2,3], expected: [3,2,1] },
      { input: [5], expected: [5] },
      { input: [], expected: [] }
    ],
    forbiddenMethods: ["reverse()", ".reverse()", "arr.reverse()"]
  },
  { 
    id: 3, 
    title: "Palindrome Checker", 
    difficulty: "medium", 
    xp: 150, 
    completed: false, 
    description: "Check if a string is a palindrome (ignore casing)",
    question: "Implement solution(s) returning true if s is a palindrome (case-insensitive).",
    starterCode: `function solution(s) {\n  // Normalize and check palindrome\n}`,
    testCases: [
      { input: "racecar", expected: true },
      { input: "RaceCar", expected: true },
      { input: "hello", expected: false }
    ]
  },
  { 
    id: 4, 
    title: "Binary Search", 
    difficulty: "medium", 
    xp: 200, 
    completed: false, 
    description: "Return index of target using binary search or -1 if not found",
    question: "Implement solution({ arr, target }) returning the index of target in sorted arr or -1.",
    starterCode: `function solution(input) {\n  const { arr, target } = input;\n  // Binary search here\n}`,
    testCases: [
      { input: { arr: [1,3,5,7,9], target: 5 }, expected: 2 },
      { input: { arr: [1,3,5,7,9], target: 6 }, expected: -1 }
    ]
  },
  { 
    id: 5, 
    title: "Knapsack (0/1)", 
    difficulty: "hard", 
    xp: 350, 
    completed: false, 
    description: "Compute maximum value for given capacity",
    question: "Implement solution({ weights, values, capacity }) returning max achievable value (0/1 knapsack).",
    starterCode: `function solution(input) {\n  const { weights, values, capacity } = input;\n  // DP solution here\n}`,
    testCases: [
      { input: { weights: [1,3,4], values: [15,20,30], capacity: 4 }, expected: 30 }
    ]
  },
  { 
    id: 6, 
    title: "Tree Post-order Traversal", 
    difficulty: "hard", 
    xp: 400, 
    completed: false, 
    description: "Return nodes in post-order traversal of a binary tree",
    question: "Implement solution(root) returning array of values in post-order (left, right, root).",
    starterCode: `function solution(root) {\n  // root: { val, left, right } or null\n}`,
    testCases: [
      { input: { val: 1, left: { val: 2, left: null, right: null }, right: { val: 3, left: null, right: null } }, expected: [2,3,1] }
    ]
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
          question: challengeData.question,
          correctAnswer: 'code',
          codeSnippet: challengeData.starterCode,
          starterCode: challengeData.starterCode,
          testCases: challengeData.testCases
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
