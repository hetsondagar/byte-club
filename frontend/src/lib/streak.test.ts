// Simple test file to verify streak logic
import { updateStreakOnActivity, checkStreakStatus, loadUserStreak } from './streak';

// Mock localStorage for testing
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: (key: string) => mockLocalStorage.store[key] || null,
  setItem: (key: string, value: string) => {
    mockLocalStorage.store[key] = value;
  },
  clear: () => {
    mockLocalStorage.store = {};
  }
};

// Override global localStorage for testing
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

function testStreakLogic() {
  console.log('🧪 Testing Streak Logic...');
  
  // Clear any existing data
  mockLocalStorage.clear();
  
  // Test 1: First activity
  console.log('\n📝 Test 1: First activity');
  const result1 = updateStreakOnActivity();
  console.log('Result:', result1);
  console.log('Expected: currentStreak=1, updated=true, streakBroken=false');
  console.log('✅ Pass:', result1.state.currentStreak === 1 && result1.updated && !result1.streakBroken);
  
  // Test 2: Activity within 48 hours (simulate 24 hours later)
  console.log('\n📝 Test 2: Activity within 48 hours');
  // Manually set lastActiveTime to 24 hours ago
  const userData = JSON.parse(mockLocalStorage.getItem('byteclub_user') || '{}');
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  userData.lastActiveTime = yesterday.toISOString();
  mockLocalStorage.setItem('byteclub_user', JSON.stringify(userData));
  
  const result2 = updateStreakOnActivity();
  console.log('Result:', result2);
  console.log('Expected: currentStreak=2, updated=true, streakBroken=false');
  console.log('✅ Pass:', result2.state.currentStreak === 2 && result2.updated && !result2.streakBroken);
  
  // Test 3: Activity after 48+ hours (simulate 50 hours later)
  console.log('\n📝 Test 3: Activity after 48+ hours');
  const userData2 = JSON.parse(mockLocalStorage.getItem('byteclub_user') || '{}');
  const twoDaysAgo = new Date(now.getTime() - 50 * 60 * 60 * 1000);
  userData2.lastActiveTime = twoDaysAgo.toISOString();
  mockLocalStorage.setItem('byteclub_user', JSON.stringify(userData2));
  
  const result3 = updateStreakOnActivity();
  console.log('Result:', result3);
  console.log('Expected: currentStreak=1, updated=true, streakBroken=true');
  console.log('✅ Pass:', result3.state.currentStreak === 1 && result3.updated && result3.streakBroken);
  
  // Test 4: Check streak status without updating
  console.log('\n📝 Test 4: Check streak status');
  const status = checkStreakStatus();
  console.log('Status:', status);
  console.log('Expected: shouldBreak=false (just updated), hoursSinceLastActivity=0');
  console.log('✅ Pass:', !status.shouldBreak && status.hoursSinceLastActivity === 0);
  
  console.log('\n🎉 All streak logic tests completed!');
}

// Export for manual testing
export { testStreakLogic };

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Only run in browser environment
  (window as any).testStreakLogic = testStreakLogic;
  console.log('💡 Run testStreakLogic() in the browser console to test the streak logic');
}



