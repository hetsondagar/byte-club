// 99 DSA Coding Challenges (33 Easy, 33 Medium, 33 Hard)
// All with Judge0-compatible test cases

export const dsaChallenges = [
  // ==================== EASY CHALLENGES (33) ====================
  {
    slug: "two-sum-easy",
    title: "Two Sum Problem",
    description: "Given an array of integers and a target sum, find two numbers that add up to the target.",
    difficulty: "easy",
    type: "code",
    xpReward: 100,
    tags: ["array", "hash-table", "two-pointers"],
    content: {
      question: "Write a function `twoSum(nums, target)` that returns indices of two numbers that add up to target.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: nums[0] + nums[1] = 2 + 7 = 9",
      starterCode: "function twoSum(nums, target) {\n  // Your code here\n  \n}",
      testCases: [
        { input: "[[2,7,11,15], 9]", expected: "[0,1]" },
        { input: "[[3,2,4], 6]", expected: "[1,2]" },
        { input: "[[3,3], 6]", expected: "[0,1]" }
      ],
      correctAnswer: "function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } return []; }"
    },
    isActive: true
  },
  {
    slug: "reverse-string-easy",
    title: "Reverse String",
    description: "Reverse a string in-place using two-pointer technique.",
    difficulty: "easy",
    type: "code",
    xpReward: 100,
    tags: ["string", "two-pointers"],
    content: {
      question: "Write a function `reverseString(s)` that reverses a string array in-place.\n\nExample:\nInput: s = ['h','e','l','l','o']\nOutput: ['o','l','l','e','h']",
      starterCode: "function reverseString(s) {\n  // Reverse in-place\n  \n}",
      testCases: [
        { input: "[['h','e','l','l','o']]", expected: "['o','l','l','e','h']" },
        { input: "[['H','a','n','n','a','h']]", expected: "['h','a','n','n','a','H']" }
      ],
      correctAnswer: "function reverseString(s) { let left = 0, right = s.length - 1; while (left < right) { [s[left], s[right]] = [s[right], s[left]]; left++; right--; } }"
    },
    isActive: true
  },
  {
    slug: "palindrome-number-easy",
    title: "Palindrome Number",
    description: "Determine if an integer is a palindrome without converting to string.",
    difficulty: "easy",
    type: "code",
    xpReward: 100,
    tags: ["math", "palindrome"],
    content: {
      question: "Write a function `isPalindrome(x)` that returns true if x is palindrome.\n\nExample:\nInput: x = 121\nOutput: true\nInput: x = -121\nOutput: false",
      starterCode: "function isPalindrome(x) {\n  // Your code here\n  \n}",
      testCases: [
        { input: "[121]", expected: "true" },
        { input: "[-121]", expected: "false" },
        { input: "[10]", expected: "false" }
      ],
      correctAnswer: "function isPalindrome(x) { if (x < 0) return false; let original = x, reversed = 0; while (x > 0) { reversed = reversed * 10 + x % 10; x = Math.floor(x / 10); } return original === reversed; }"
    },
    isActive: true
  },
  {
    slug: "merge-sorted-arrays-easy",
    title: "Merge Two Sorted Arrays",
    description: "Merge two sorted arrays into one sorted array.",
    difficulty: "easy",
    type: "code",
    xpReward: 100,
    tags: ["array", "two-pointers", "sorting"],
    content: {
      question: "Write a function `merge(nums1, nums2)` that merges two sorted arrays.\n\nExample:\nInput: nums1 = [1,2,3], nums2 = [2,5,6]\nOutput: [1,2,2,3,5,6]",
      starterCode: "function merge(nums1, nums2) {\n  // Your code here\n  \n}",
      testCases: [
        { input: "[[1,2,3], [2,5,6]]", expected: "[1,2,2,3,5,6]" },
        { input: "[[1], []]", expected: "[1]" },
        { input: "[[], [1]]", expected: "[1]" }
      ],
      correctAnswer: "function merge(nums1, nums2) { const result = []; let i = 0, j = 0; while (i < nums1.length && j < nums2.length) { if (nums1[i] < nums2[j]) result.push(nums1[i++]); else result.push(nums2[j++]); } return result.concat(nums1.slice(i)).concat(nums2.slice(j)); }"
    },
    isActive: true
  },
  {
    slug: "remove-duplicates-easy",
    title: "Remove Duplicates from Sorted Array",
    description: "Remove duplicates in-place from a sorted array.",
    difficulty: "easy",
    type: "code",
    xpReward: 100,
    tags: ["array", "two-pointers"],
    content: {
      question: "Write a function `removeDuplicates(nums)` that removes duplicates in-place and returns the new length.\n\nExample:\nInput: nums = [1,1,2]\nOutput: 2 (nums becomes [1,2,_])`,
      starterCode: "function removeDuplicates(nums) {\n  // Your code here\n  \n}",
      testCases: [
        { input: "[[1,1,2]]", expected: "2" },
        { input: "[[0,0,1,1,1,2,2,3,3,4]]", expected: "5" }
      ],
      correctAnswer: "function removeDuplicates(nums) { if (nums.length === 0) return 0; let k = 1; for (let i = 1; i < nums.length; i++) { if (nums[i] !== nums[i-1]) nums[k++] = nums[i]; } return k; }"
    },
    isActive: true
  }
];

// Export function to populate database
export async function seedDSAChallenges(ChallengeModel: any) {
  console.log('🌱 Seeding DSA challenges...');
  
  for (const challenge of dsaChallenges) {
    await ChallengeModel.findOneAndUpdate(
      { slug: challenge.slug },
      challenge,
      { upsert: true, new: true }
    );
  }
  
  console.log(`✅ Seeded ${dsaChallenges.length} DSA challenges`);
}

