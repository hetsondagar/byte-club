import mongoose from 'mongoose';
import Challenge from './src/models/Challenge';

// Simple test challenges
const testChallenges = [
  {
    slug: "two-sum-test",
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
        { input: "[2,7,11,15]\n9", expected: "[0,1]" }
      ],
      correctAnswer: "function twoSum(n,t){const m=new Map();for(let i=0;i<n.length;i++){if(m.has(t-n[i]))return[m.get(t-n[i]),i];m.set(n[i],i);}}"
    },
    isActive: true
  },
  {
    slug: "reverse-string-test",
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
  }
];

async function testSeed() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/byte_club');
    console.log('✅ Connected to MongoDB');
    
    console.log('🌱 Seeding test challenges...');
    
    for (const challenge of testChallenges) {
      await Challenge.findOneAndUpdate(
        { slug: challenge.slug },
        challenge,
        { upsert: true, new: true }
      );
      console.log(`✅ Seeded: ${challenge.title}`);
    }
    
    console.log('✅ Test seeding completed successfully');
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testSeed();
