// Debug utility for streak system
import { checkStreakStatus, loadUserStreak, migrateOldStreakData } from './streak';

export function debugStreakSystem() {
  console.log('🔍 Debugging Streak System...');
  
  // Check current localStorage data
  const raw = localStorage.getItem('byteclub_user');
  console.log('Raw localStorage data:', raw);
  
  if (raw) {
    const user = JSON.parse(raw);
    console.log('Parsed user data:', user);
    console.log('Current streak:', user.currentStreak);
    console.log('Last active date:', user.lastActiveDate);
    console.log('Last active time:', user.lastActiveTime);
  }
  
  // Check streak status
  const streakState = loadUserStreak();
  console.log('Loaded streak state:', streakState);
  
  const status = checkStreakStatus();
  console.log('Streak status:', status);
  
  // Calculate time difference manually
  if (streakState.lastActiveDate) {
    const now = new Date();
    const lastDate = new Date(streakState.lastActiveDate + 'T00:00:00Z');
    const hoursDiff = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
    console.log('Manual calculation - hours since last activity:', hoursDiff);
    console.log('Should break?', hoursDiff > 48);
  }
  
  console.log('✅ Debug complete!');
}

// Force refresh function for Home page
export function forceRefreshHomePage() {
  console.log('🔄 Forcing Home page refresh...');
  window.dispatchEvent(new CustomEvent('streakMigrated', { 
    detail: { newStreak: 1 } 
  }));
  console.log('✅ Home page refresh triggered');
}

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).debugStreakSystem = debugStreakSystem;
  (window as any).migrateOldStreakData = migrateOldStreakData;
  (window as any).forceRefreshHomePage = forceRefreshHomePage;
  console.log('💡 Run debugStreakSystem() in the browser console to debug the streak system');
  console.log('💡 Run migrateOldStreakData() to manually migrate old streak data');
  console.log('💡 Run forceRefreshHomePage() to force Home page to refresh');
}



