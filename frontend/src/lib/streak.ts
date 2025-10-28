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
  // Handle empty or invalid dates
  if (!a || !b) {
    return NaN;
  }
  
  const d1 = new Date(a + 'T00:00:00Z');
  const d2 = new Date(b + 'T00:00:00Z');
  
  // Check if dates are valid
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return NaN;
  }
  
  const ms = d2.getTime() - d1.getTime(); // Don't use abs - we need signed difference
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function loadUserStreak(): StreakState {
  try {
    const raw = localStorage.getItem('byteclub_user');
    if (!raw) return { currentStreak: 0, longestStreak: 0 };
    const user = JSON.parse(raw);
    
    // Validate dates - clear invalid/future dates but DO NOT set fake ones
    const today = new Date().toISOString().slice(0, 10);
    if (user.lastActiveDate) {
      // If date is in the future or invalid format, clear it
      if (user.lastActiveDate > today || !/^\d{4}-\d{2}-\d{2}$/.test(user.lastActiveDate)) {
        console.log('⚠️ Invalid lastActiveDate in loadUserStreak, clearing:', user.lastActiveDate);
        user.lastActiveDate = undefined;
        user.lastActiveTime = undefined;
        localStorage.setItem('byteclub_user', JSON.stringify(user));
      }
    }
    
    // Migration: Reset streak if we have a streak but no dates
    // Without dates, we can't verify the streak is valid, so reset to 0
    if (user.currentStreak > 0 && !user.lastActiveDate && !user.lastActiveTime) {
      console.log('🔄 Old streak data detected without dates - resetting streak to 0 (will start fresh on next activity)');
      user.currentStreak = 0;
      user.longestStreak = Math.max(user.longestStreak || 0, 0);
      // Don't set dates here - they'll be set when user completes an activity
      localStorage.setItem('byteclub_user', JSON.stringify(user));
      console.log('✅ Reset streak to 0 (no dates available to validate streak)');
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
  } else if (!lastTime || !state.lastActiveDate) {
    // This should not happen now since new users are handled above, but keeping as fallback
    console.log('🔍 Streak Debug - FALLBACK PATH: no lastTime/lastActiveDate but not detected as new user');
    console.log('🔍 Setting dates manually - today:', today, 'now:', now);
    const existingStreak = state.currentStreak || 0;
    state.currentStreak = existingStreak > 0 ? existingStreak : 1;
    state.longestStreak = Math.max(state.longestStreak || 0, state.currentStreak);
    state.lastActiveDate = today;
    state.lastActiveTime = now;
    state.isFirstActivity = false; // Not first activity since not detected as new user
    updated = true;
    streakBroken = false;
    isFirstActivity = false;
    console.log('🔥 FALLBACK PATH - streak set to:', state.currentStreak, 'day(s), dates set to:', state.lastActiveDate, state.lastActiveTime);
    console.log('🔍 State after fallback:', state);
  } else {
    console.log('🔍 Streak Debug - EXISTING USER PATH: User has lastTime, checking days difference');
    const lastDate = state.lastActiveDate;
    const daysDiff = daysBetweenISO(lastDate || '', today);
    console.log(`📅 EXISTING USER PATH - Days since last activity: ${daysDiff} (last: ${lastDate}, today: ${today})`);
    
    // Handle case where lastActiveDate is missing or invalid
    if (!lastDate || isNaN(daysDiff) || daysDiff < 0) {
      console.log('⚠️ Invalid or missing lastActiveDate - resetting streak to 1');
      state.currentStreak = 1;
      state.longestStreak = Math.max(state.longestStreak, state.currentStreak);
      state.lastActiveDate = today;
      state.lastActiveTime = now;
      state.isFirstActivity = false;
      updated = true;
      streakBroken = false; // Don't show broken message for invalid data
      console.log(`🔄 Reset streak due to invalid date data - starting at 1 day`);
    } else if (daysDiff >= 2) {
      // 2 or more days gap - streak broken (missed at least one day)
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
      
      // Streak broken - start new streak at 1 (but don't show for new users)
      const hadExistingStreak = state.currentStreak > 0; // Check BEFORE resetting
      streakBroken = !isNewUser && hadExistingStreak; // Only show if they had an existing streak
      state.currentStreak = 1; // Start new streak
      state.longestStreak = Math.max(state.longestStreak, state.currentStreak);
      state.lastActiveDate = today;
      state.lastActiveTime = now;
      state.isFirstActivity = false; // Not first activity, just streak reset
      updated = true;
      console.log(`💔 Streak broken (${daysDiff} days gap) - starting new streak: 1 day (had existing streak: ${hadExistingStreak}, streakBroken: ${streakBroken})`);
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
      // daysDiff < 0 (future date) - shouldn't happen normally, but handle gracefully
      state.lastActiveTime = now;
      state.lastActiveDate = today;
      state.isFirstActivity = false;
      updated = true;
      console.log(`⚠️ Edge case: daysDiff=${daysDiff} (future date) - resetting to today`);
    }
  }

  // Optional bonus: +10 XP every 3 days
  if (updated && state.currentStreak > 0 && state.currentStreak % 3 === 0) {
    bonusXP = 10;
  }

  try {
    const raw = localStorage.getItem('byteclub_user');
    const user = raw ? JSON.parse(raw) : {};
    
    // FORCE set dates ALWAYS - this is critical for streak tracking
    const today = getTodayISO();
    const now = getNowISO();
    
    user.currentStreak = state.currentStreak;
    user.longestStreak = state.longestStreak;
    
    // CRITICAL: ALWAYS set dates when streak is updated, regardless of state
    // If the state has dates, use them. If not, use today (this is an activity happening NOW)
    if (state.lastActiveDate && state.lastActiveTime) {
      user.lastActiveDate = state.lastActiveDate;
      user.lastActiveTime = state.lastActiveTime;
    } else {
      // If state doesn't have dates but we're updating streak (activity happening), set to now
      user.lastActiveDate = today;
      user.lastActiveTime = now;
      state.lastActiveDate = today;
      state.lastActiveTime = now;
      console.log('⚠️ State had no dates, but activity detected - setting to now:', { today, now });
    }
    
    if (bonusXP > 0) {
      const currentXP = Number(user.totalXP || 0);
      user.totalXP = currentXP + bonusXP;
    }
    
    localStorage.setItem('byteclub_user', JSON.stringify(user));
    console.log('💾 Streak saved to localStorage:', {
      currentStreak: user.currentStreak,
      lastActiveDate: user.lastActiveDate,
      lastActiveTime: user.lastActiveTime,
      stateHadDate: !!state.lastActiveDate,
      stateHadTime: !!state.lastActiveTime
    });
    
    // Triple-check it was actually saved
    const verify = JSON.parse(localStorage.getItem('byteclub_user') || '{}');
    if (!verify.lastActiveDate || !verify.lastActiveTime) {
      console.error('❌ CRITICAL: Dates were NOT saved after write! Forcing save...');
      verify.lastActiveDate = today;
      verify.lastActiveTime = now;
      verify.currentStreak = state.currentStreak;
      localStorage.setItem('byteclub_user', JSON.stringify(verify));
      console.log('✅ Forced date save:', { 
        lastActiveDate: verify.lastActiveDate, 
        lastActiveTime: verify.lastActiveTime,
        currentStreak: verify.currentStreak
      });
    }
  } catch (error) {
    console.error('❌ Error saving streak to localStorage:', error);
    // Even on error, try to save dates
    try {
      const raw = localStorage.getItem('byteclub_user');
      const user = raw ? JSON.parse(raw) : {};
      const today = getTodayISO();
      const now = getNowISO();
      user.lastActiveDate = today;
      user.lastActiveTime = now;
      user.currentStreak = state.currentStreak || 1;
      localStorage.setItem('byteclub_user', JSON.stringify(user));
      console.log('✅ Emergency date save on error:', { lastActiveDate: today });
    } catch (e) {
      console.error('❌ Failed emergency save:', e);
    }
  }

  console.log('🔍 Streak Debug - Final return values:', { 
    updated, 
    streakBroken, 
    isFirstActivity, 
    currentStreak: state.currentStreak,
    lastActiveDate: state.lastActiveDate,
    lastActiveTime: state.lastActiveTime
  });
  
  // FINAL VERIFICATION: Make absolutely sure dates are in the returned state
  if (updated && (!state.lastActiveDate || !state.lastActiveTime)) {
    const today = getTodayISO();
    const now = getNowISO();
    state.lastActiveDate = today;
    state.lastActiveTime = now;
    console.log('⚠️ CRITICAL: Dates missing in final state! Forcing them:', { today, now });
    
    // Save again with forced dates
    try {
      const raw = localStorage.getItem('byteclub_user');
      if (raw) {
        const user = JSON.parse(raw);
        user.lastActiveDate = today;
        user.lastActiveTime = now;
        user.currentStreak = state.currentStreak;
        localStorage.setItem('byteclub_user', JSON.stringify(user));
        console.log('✅ Forced dates saved in final verification');
      }
    } catch (e) {
      console.error('❌ Failed to force save dates:', e);
    }
  }
  
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

// Get the actual current streak status based on dates (for display purposes)
// This checks if the streak should be considered broken even if stored value says otherwise
export function getActualStreakStatus(): {
  currentStreak: number;
  isBroken: boolean;
  daysSinceLastActivity: number;
} {
  const state = loadUserStreak();
  const today = getTodayISO();
  const lastDate = state.lastActiveDate;
  
  // If no last active date, streak is broken/new
  if (!lastDate || !state.lastActiveTime) {
    return {
      currentStreak: 0,
      isBroken: true,
      daysSinceLastActivity: Infinity
    };
  }
  
  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lastDate)) {
    return {
      currentStreak: 0,
      isBroken: true,
      daysSinceLastActivity: Infinity
    };
  }
  
  const daysDiff = daysBetweenISO(lastDate, today);
  
  // If invalid or future date
  if (isNaN(daysDiff) || daysDiff < 0) {
    return {
      currentStreak: 0,
      isBroken: true,
      daysSinceLastActivity: Infinity
    };
  }
  
  // If more than 2 days have passed, streak is broken
  if (daysDiff >= 2) {
    return {
      currentStreak: 0,
      isBroken: true,
      daysSinceLastActivity: daysDiff
    };
  }
  
  // Streak is still valid
  return {
    currentStreak: state.currentStreak,
    isBroken: false,
    daysSinceLastActivity: daysDiff
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

// DEPRECATED: Do not automatically fix streaks on page load
// Streaks should only update when actual activity occurs
// This function is kept for migration purposes only
export function fixBrokenStreakForActiveUser(): void {
  // No-op - streaks should only update on actual activity
  // This prevents incorrect date updates when just visiting the page
  console.log('🔧 fixBrokenStreakForActiveUser: Deprecated - streaks now only update on activity');
}

// Validate lastActiveDate - DO NOT modify it, only validate it's not corrupted
// This function should NEVER update dates on page load - only validate data integrity
export function validateStreakDates(): void {
  try {
    const raw = localStorage.getItem('byteclub_user');
    if (!raw) {
      return;
    }
    
    const user = JSON.parse(raw);
    const lastActiveDate = user.lastActiveDate;
    const today = new Date().toISOString().slice(0, 10);
    
    // Only clear invalid/future dates - DO NOT set fake dates
    if (lastActiveDate) {
      // Check if date is in the future or invalid format
      if (lastActiveDate > today || !/^\d{4}-\d{2}-\d{2}$/.test(lastActiveDate)) {
        console.log('⚠️ Invalid lastActiveDate detected, clearing:', lastActiveDate);
        user.lastActiveDate = undefined;
        user.lastActiveTime = undefined;
        localStorage.setItem('byteclub_user', JSON.stringify(user));
      }
    }
  } catch (error) {
    console.error('Error validating streak dates:', error);
  }
}

