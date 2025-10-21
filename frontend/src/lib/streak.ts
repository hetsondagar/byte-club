export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: string; // ISO date string (YYYY-MM-DD)
  lastActiveTime?: string; // ISO datetime string for 48-hour tracking
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

export function updateStreakOnActivity(): { updated: boolean; state: StreakState; bonusXP: number; streakBroken: boolean } {
  const now = getNowISO();
  const today = getTodayISO();
  const state = loadUserStreak();
  const lastTime = state.lastActiveTime;
  let updated = false;
  let bonusXP = 0;
  let streakBroken = false;

  if (!lastTime) {
    // First activity
    state.currentStreak = 1;
    state.longestStreak = Math.max(state.longestStreak, state.currentStreak);
    state.lastActiveDate = today;
    state.lastActiveTime = now;
    updated = true;
  } else {
    const hoursDiff = hoursBetweenISO(lastTime, now);
    
    if (hoursDiff <= 48) {
      // Within 48 hours, increment streak
      state.currentStreak += 1;
      state.longestStreak = Math.max(state.longestStreak, state.currentStreak);
      state.lastActiveDate = today;
      state.lastActiveTime = now;
      updated = true;
    } else {
      // More than 48 hours, reset streak
      streakBroken = true;
      state.currentStreak = 1; // counts current activity as day 1
      state.lastActiveDate = today;
      state.lastActiveTime = now;
      updated = true;
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

  return { updated, state, bonusXP, streakBroken };
}

export function checkStreakStatus(): { shouldBreak: boolean; hoursSinceLastActivity: number } {
  const state = loadUserStreak();
  const lastTime = state.lastActiveTime;
  const lastDate = state.lastActiveDate;
  
  // If we have lastActiveTime, use it (new system)
  if (lastTime) {
    const now = getNowISO();
    const hoursDiff = hoursBetweenISO(lastTime, now);
    
    return {
      shouldBreak: hoursDiff > 48,
      hoursSinceLastActivity: hoursDiff
    };
  }
  
  // Fallback to lastActiveDate (old system) - assume it was at start of day
  if (lastDate) {
    const now = new Date();
    const lastDateObj = new Date(lastDate + 'T00:00:00Z');
    const hoursDiff = (now.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60);
    
    return {
      shouldBreak: hoursDiff > 48,
      hoursSinceLastActivity: hoursDiff
    };
  }
  
  // No activity recorded
  return { shouldBreak: false, hoursSinceLastActivity: 0 };
}

