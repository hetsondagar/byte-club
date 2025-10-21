export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: string; // ISO date string (YYYY-MM-DD)
  lastActiveTime?: string; // ISO datetime string for 48-hour tracking
  isFirstActivity?: boolean; // Flag to track if this is truly the first activity
}

function getTodayISO(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function getNowISO(): string {
  return new Date().toISOString();
}

function hoursBetweenISO(a: string, b: string): number {
  const d1 = new Date(a);
  const d2 = new Date(b);
  const ms = Math.abs(d2.getTime() - d1.getTime());
  return ms / (1000 * 60 * 60); // Return hours as decimal
}

function daysBetweenISO(a: string, b: string): number {
  const d1 = new Date(a + 'T00:00:00Z');
  const d2 = new Date(b + 'T00:00:00Z');
  const ms = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function loadUserStreak(): StreakState {
  try {
    const raw = localStorage.getItem('byteclub_user');
    if (!raw) return { currentStreak: 0, longestStreak: 0 };
    const user = JSON.parse(raw);
    
    // Migration: If we have old streak data but no lastActiveTime, reset to 1 day
    if (user.currentStreak > 0 && !user.lastActiveTime) {
      console.log('🔄 Migrating old streak data to new system');
      const now = new Date().toISOString();
      const today = now.slice(0, 10);
      
      // Reset streak to 1 day and set current time as last active
      user.currentStreak = 1;
      user.lastActiveTime = now;
      user.lastActiveDate = today;
      
      // Save the migrated data
      localStorage.setItem('byteclub_user', JSON.stringify(user));
      
      // Trigger a custom event to notify components of the migration
      window.dispatchEvent(new CustomEvent('streakMigrated', { 
        detail: { newStreak: user.currentStreak } 
      }));
      
      console.log('✅ Streak migrated: old streak reset to 1 day with current timestamp');
    }
    
    // Additional migration: If streak is 3 and we have lastActiveTime, it might be old data
    if (user.currentStreak === 3 && user.lastActiveTime) {
      console.log('🔄 Detected old 3-day streak, resetting to 1 day');
      const now = new Date().toISOString();
      const today = now.slice(0, 10);
      
      user.currentStreak = 1;
      user.lastActiveTime = now;
      user.lastActiveDate = today;
      
      localStorage.setItem('byteclub_user', JSON.stringify(user));
      
      window.dispatchEvent(new CustomEvent('streakMigrated', { 
        detail: { newStreak: user.currentStreak } 
      }));
      
      console.log('✅ Old 3-day streak reset to 1 day');
    }
    
    return {
      currentStreak: Number(user.currentStreak || 0),
      longestStreak: Number(user.longestStreak || 0),
      lastActiveDate: user.lastActiveDate || undefined,
      lastActiveTime: user.lastActiveTime || undefined,
    };
  } catch {
    return { currentStreak: 0, longestStreak: 0 };
  }
}

export function updateStreakOnActivity(): { updated: boolean; state: StreakState; bonusXP: number; streakBroken: boolean; isFirstActivity: boolean } {
  const now = getNowISO();
  const today = getTodayISO();
  const state = loadUserStreak();
  const lastTime = state.lastActiveTime;
  let updated = false;
  let bonusXP = 0;
  let streakBroken = false;
  let isFirstActivity = false;

  // Debug logging
  console.log('🔍 Streak Debug - loadUserStreak result:', state);
  console.log('🔍 Streak Debug - lastTime:', lastTime);
  console.log('🔍 Streak Debug - has lastTime:', !!lastTime);
  console.log('🔍 Streak Debug - Current time:', now);
  console.log('🔍 Streak Debug - Today:', today);

  // Check if this is a new user (currentStreak: 0, no completed challenges, low XP)
  const userData = localStorage.getItem('byteclub_user');
  let isNewUser = false;
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('🔍 Streak Debug - Full user data:', user);
      const hasCompletedChallenges = (user.completedChallenges?.length || 0) > 0;
      const hasAnyXP = (user.totalXP || 0) > 0;
      const hasZeroStreak = (user.currentStreak || 0) === 0;
      
      // A user with ANY XP should not be considered a new user
      // Only consider truly new users (no XP, no challenges, zero streak)
      isNewUser = !hasCompletedChallenges && !hasAnyXP && hasZeroStreak;
      console.log('🔍 Streak Debug - isNewUser:', isNewUser, { hasCompletedChallenges, hasAnyXP, hasZeroStreak });
      console.log('🔍 Streak Debug - User values:', { 
        completedChallenges: user.completedChallenges, 
        totalXP: user.totalXP, 
        currentStreak: user.currentStreak 
      });
    } catch (e) {
      console.log('🔍 Streak Debug - Error parsing user data:', e);
      isNewUser = true;
    }
  } else {
    console.log('🔍 Streak Debug - No user data found');
    isNewUser = true;
  }

  // If this is a new user, always treat as first activity regardless of old data
  if (isNewUser) {
    console.log('🔍 Streak Debug - NEW USER PATH: New user detected, treating as first activity');
    console.log('🔍 Streak Debug - NEW USER PATH: Setting streakBroken = false for new user');
    state.currentStreak = 1;
    state.longestStreak = Math.max(state.longestStreak, state.currentStreak);
    state.lastActiveDate = today;
    state.lastActiveTime = now;
    state.isFirstActivity = true;
    updated = true;
    streakBroken = false;
    isFirstActivity = true;
    console.log('🔥 NEW USER PATH - streak started: 1 day, streakBroken = false');
  } else if (!lastTime) {
    // This should not happen now since new users are handled above, but keeping as fallback
    console.log('🔍 Streak Debug - FALLBACK PATH: no lastTime but not detected as new user');
    state.currentStreak = 1;
    state.longestStreak = Math.max(state.longestStreak, state.currentStreak);
    state.lastActiveDate = today;
    state.lastActiveTime = now;
    state.isFirstActivity = false; // Not first activity since not detected as new user
    updated = true;
    streakBroken = false;
    isFirstActivity = false;
    console.log('🔥 FALLBACK PATH - streak started: 1 day');
  } else {
    console.log('🔍 Streak Debug - EXISTING USER PATH: User has lastTime, checking days difference');
    const lastDate = state.lastActiveDate;
    const daysDiff = daysBetweenISO(lastDate || '', today);
    console.log(`📅 EXISTING USER PATH - Days since last activity: ${daysDiff} (last: ${lastDate}, today: ${today})`);
    
    if (daysDiff > 2) {
      // Check if this is a new user to avoid showing "Streak Broken!" inappropriately
      const userData = localStorage.getItem('byteclub_user');
      let isNewUser = false;
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          const hasCompletedChallenges = (user.completedChallenges?.length || 0) > 0;
          const hasLowXP = (user.totalXP || 0) < 100;
          isNewUser = !hasCompletedChallenges && hasLowXP;
        } catch (e) {
          isNewUser = true; // If we can't parse, assume new user
        }
      } else {
        isNewUser = true; // No user data = new user
      }
      
      // More than 2 days - streak broken (but don't show for new users)
      streakBroken = !isNewUser; // Only show streak broken for existing users
      state.currentStreak = 1; // Start new streak
      state.lastActiveDate = today;
      state.lastActiveTime = now;
      state.isFirstActivity = false; // Not first activity, just streak reset
      updated = true;
      console.log(`💔 Streak broken (>2 days) - starting new streak: 1 day (new user: ${isNewUser}, streakBroken: ${streakBroken})`);
    } else if (daysDiff === 1) {
      // Exactly 1 day difference - increment streak (consecutive days)
      state.currentStreak += 1;
      state.longestStreak = Math.max(state.longestStreak, state.currentStreak);
      state.lastActiveDate = today;
      state.lastActiveTime = now;
      state.isFirstActivity = false; // Not first activity
      updated = true;
      console.log(`🔥 Streak updated: ${state.currentStreak} days (consecutive day)`);
    } else if (daysDiff === 0) {
      // Same day - no streak update, just update last active time
      state.lastActiveTime = now;
      state.isFirstActivity = false; // Not first activity
      updated = true;
      console.log(`⏳ Same day activity - no streak update, just updating last active time`);
    } else {
      // daysDiff < 0 (shouldn't happen) or other edge cases
      state.lastActiveTime = now;
      state.isFirstActivity = false; // Not first activity
      updated = true;
      console.log(`⚠️ Edge case: daysDiff=${daysDiff} - just updating last active time`);
    }
  }

  // Optional bonus: +10 XP every 3 days
  if (updated && state.currentStreak > 0 && state.currentStreak % 3 === 0) {
    bonusXP = 10;
  }

  try {
    const raw = localStorage.getItem('byteclub_user');
    const user = raw ? JSON.parse(raw) : {};
    user.currentStreak = state.currentStreak;
    user.longestStreak = state.longestStreak;
    user.lastActiveDate = state.lastActiveDate;
    user.lastActiveTime = state.lastActiveTime;
    if (bonusXP > 0) {
      const currentXP = Number(user.totalXP || 0);
      user.totalXP = currentXP + bonusXP;
    }
    localStorage.setItem('byteclub_user', JSON.stringify(user));
  } catch {}

  console.log('🔍 Streak Debug - Final return values:', { updated, streakBroken, isFirstActivity, currentStreak: state.currentStreak });
  
  // Dispatch event to notify components of streak changes
  if (updated) {
    window.dispatchEvent(new CustomEvent('streakMigrated', { 
      detail: { newStreak: state.currentStreak } 
    }));
    console.log('🔍 Streak Debug - Dispatched streakMigrated event with streak:', state.currentStreak);
  }
  
  return { updated, state, bonusXP, streakBroken, isFirstActivity };
}

export function checkStreakStatus(): { 
  canUpdate: boolean; 
  hoursSinceLastActivity: number; 
  streakWillBreak: boolean;
  currentStreak: number;
} {
  const state = loadUserStreak();
  const lastTime = state.lastActiveTime;
  
  if (!lastTime) {
    return {
      canUpdate: true,
      hoursSinceLastActivity: 0,
      streakWillBreak: false,
      currentStreak: state.currentStreak
    };
  }
  
  const now = getNowISO();
  const hoursDiff = hoursBetweenISO(lastTime, now);
  
  return {
    canUpdate: hoursDiff >= 24,
    hoursSinceLastActivity: hoursDiff,
    streakWillBreak: hoursDiff > 48,
    currentStreak: state.currentStreak
  };
}

// Force reset streak to 1 day (for debugging)
export function forceResetStreakTo1Day(): void {
  try {
    const raw = localStorage.getItem('byteclub_user');
    if (!raw) {
      console.log('No user data found');
      return;
    }
    
    const user = JSON.parse(raw);
    console.log('Before force reset:', {
      currentStreak: user.currentStreak,
      lastActiveTime: user.lastActiveTime,
      lastActiveDate: user.lastActiveDate
    });
    
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    
    user.currentStreak = 1;
    user.lastActiveTime = now;
    user.lastActiveDate = today;
    
    localStorage.setItem('byteclub_user', JSON.stringify(user));
    
    console.log('✅ Force reset complete:', {
      currentStreak: user.currentStreak,
      lastActiveTime: user.lastActiveTime,
      lastActiveDate: user.lastActiveDate
    });
    
    // Trigger event to notify components
    window.dispatchEvent(new CustomEvent('streakMigrated', { 
      detail: { newStreak: user.currentStreak } 
    }));
  } catch (error) {
    console.error('Force reset failed:', error);
  }
}

// Manual migration function for debugging
export function migrateOldStreakData(): void {
  try {
    const raw = localStorage.getItem('byteclub_user');
    if (!raw) {
      console.log('No user data found');
      return;
    }
    
    const user = JSON.parse(raw);
    console.log('Before migration:', {
      currentStreak: user.currentStreak,
      lastActiveTime: user.lastActiveTime,
      lastActiveDate: user.lastActiveDate
    });
    
    if (user.currentStreak > 0 && !user.lastActiveTime) {
      const now = new Date().toISOString();
      const today = now.slice(0, 10);
      
      user.currentStreak = 1;
      user.lastActiveTime = now;
      user.lastActiveDate = today;
      
      localStorage.setItem('byteclub_user', JSON.stringify(user));
      
      console.log('✅ Migration complete:', {
        currentStreak: user.currentStreak,
        lastActiveTime: user.lastActiveTime,
        lastActiveDate: user.lastActiveDate
      });
    } else {
      console.log('No migration needed - data already in new format');
    }
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

export function fixBrokenStreakForActiveUser(): void {
  try {
    const raw = localStorage.getItem('byteclub_user');
    if (!raw) {
      console.log('🔧 fixBrokenStreakForActiveUser: No user data found');
      return;
    }
    
    const user = JSON.parse(raw);
    const hasAnyXP = (user.totalXP || 0) > 0;
    const hasCompletedChallenges = (user.completedChallenges?.length || 0) > 0;
    const hasCompletedAdventureNodes = (user.completedAdventureNodes?.length || 0) > 0;
    const hasZeroStreak = (user.currentStreak || 0) === 0;
    
    console.log('🔧 fixBrokenStreakForActiveUser: Checking user data:', {
      totalXP: user.totalXP,
      completedChallenges: user.completedChallenges?.length || 0,
      completedAdventureNodes: user.completedAdventureNodes?.length || 0,
      currentStreak: user.currentStreak,
      hasAnyXP,
      hasCompletedChallenges,
      hasCompletedAdventureNodes,
      hasZeroStreak
    });
    
    // Check if user has any activities (XP, challenges, adventure nodes)
    const hasAnyActivities = hasAnyXP || hasCompletedChallenges || hasCompletedAdventureNodes;
    
    console.log('🔧 fixBrokenStreakForActiveUser: hasAnyActivities =', hasAnyActivities);
    
    // If user has any activities but zero streak, fix it
    if (hasAnyActivities && hasZeroStreak) {
      console.log('🔧 Fixing broken streak for active user:', {
        totalXP: user.totalXP,
        completedChallenges: user.completedChallenges?.length || 0,
        completedAdventureNodes: user.completedAdventureNodes?.length || 0,
        currentStreak: user.currentStreak
      });
      
      user.currentStreak = 1;
      user.longestStreak = Math.max(user.longestStreak || 0, 1);
      user.lastActiveDate = new Date().toISOString().slice(0, 10);
      user.lastActiveTime = new Date().toISOString();
      
      localStorage.setItem('byteclub_user', JSON.stringify(user));
      
      // Trigger event to notify components
      window.dispatchEvent(new CustomEvent('streakMigrated', { 
        detail: { newStreak: 1 } 
      }));
      
      console.log('✅ Fixed broken streak for active user');
    } else {
      console.log('🔍 No streak fix needed:', {
        hasAnyActivities,
        hasZeroStreak,
        totalXP: user.totalXP,
        completedChallenges: user.completedChallenges?.length || 0,
        completedAdventureNodes: user.completedAdventureNodes?.length || 0
      });
    }
  } catch (error) {
    console.error('Error fixing broken streak:', error);
  }
}

