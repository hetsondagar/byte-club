import mongoose from 'mongoose';
import Challenge from '../models/Challenge';
import { config } from '../config';
import logger from '../config/logger';

// Test with just a few challenges first
const testChallenges = [
  {
    slug: "two-sum",
    title: "Two Sum",
    description: "Two Sum - DSA Challenge",
    type: "code",
    difficulty: "easy",
    xpReward: 100,
    tags: ["array", "hash-table"],
    content: {
      question: "Find two indices that sum to target",
      starterCode: "function twoSum(nums, target) {\n  \n}",
      testCases: [
        { input: "[2,7,11,15]\n9", expected: "[0,1]" },
        { input: "[3,2,4]\n6", expected: "[1,2]" }
      ],
      correctAnswer: "function twoSum(n,t){const m=new Map();for(let i=0;i<n.length;i++){if(m.has(t-n[i]))return[m.get(t-n[i]),i];m.set(n[i],i);}}"
    },
    isActive: true
  },
  {
    slug: "reverse-string",
    title: "Reverse String",
    description: "Reverse String - DSA Challenge",
    type: "code", 
    difficulty: "easy",
    xpReward: 100,
    tags: ["string", "two-pointers"],
    content: {
      question: "Reverse string array in-place",
      starterCode: "function reverseString(s){\n  \n}",
      testCases: [
        { input: '["h","e","l","l","o"]', expected: '["o","l","l","e","h"]' }
      ],
      correctAnswer: "function reverseString(s){let l=0,r=s.length-1;while(l<r){[s[l],s[r]]=[s[r],s[l]];l++;r--;}}"
    },
    isActive: true
  },
  {
    slug: "3sum",
    title: "3Sum",
    description: "3Sum - DSA Challenge",
    type: "code",
    difficulty: "medium",
    xpReward: 200,
    tags: ["array", "two-pointers"],
    content: {
      question: "Find all triplets that sum to zero",
      starterCode: "function threeSum(nums){\n  \n}",
      testCases: [
        { input: "[-1,0,1,2,-1,-4]", expected: "[[-1,-1,2],[-1,0,1]]" }
      ],
      correctAnswer: "function threeSum(n){n.sort((a,b)=>a-b);const r=[];for(let i=0;i<n.length-2;i++){if(i>0&&n[i]===n[i-1])continue;let l=i+1,ri=n.length-1;while(l<ri){const s=n[i]+n[l]+n[ri];if(s===0){r.push([n[i],n[l],n[ri]]);while(l<ri&&n[l]===n[l+1])l++;while(l<ri&&n[ri]===n[ri-1])ri--;l++;ri--;}else if(s<0)l++;else ri--;}}return r;}"
    },
    isActive: true
  }
];

// Seed function
export async function seedTestChallenges() {
  try {
    logger.info('🌱 Starting test challenges seed...');
    
    for (const challenge of testChallenges) {
      await Challenge.findOneAndUpdate(
        { slug: challenge.slug },
        challenge,
        { upsert: true, new: true }
      );
    }
    
    logger.info(`✅ Successfully seeded ${testChallenges.length} test challenges`);
    return testChallenges.length;
  } catch (error) {
    logger.error('❌ Error seeding challenges:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  (async () => {
    try {
      const mongoUri = config.mongoUri || process.env.MONGO_URI;
      await mongoose.connect(mongoUri + '/byte_club');
      logger.info('✅ Connected to MongoDB');
      
      await seedTestChallenges();
      
      await mongoose.disconnect();
      logger.info('✅ Disconnected from MongoDB');
      process.exit(0);
    } catch (error) {
      logger.error('Failed:', error);
      process.exit(1);
    }
  })();
}
