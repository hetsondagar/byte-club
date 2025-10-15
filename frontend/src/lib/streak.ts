export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: string; // ISO date string (YYYY-MM-DD)
}

function getTodayISO(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10);
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
    };
  } catch {
    return { currentStreak: 0, longestStreak: 0 };
  }
}

export function updateStreakOnActivity(): { updated: boolean; state: StreakState; bonusXP: number } {
  const today = getTodayISO();
  const state = loadUserStreak();
  const last = state.lastActiveDate;
  let updated = false;
  let bonusXP = 0;

  if (!last) {
    state.currentStreak = 1;
    state.longestStreak = Math.max(state.longestStreak, state.currentStreak);
    state.lastActiveDate = today;
    updated = true;
  } else {
    const gap = daysBetweenISO(last, today);
    if (gap === 0) {
      // same day, no change
    } else if (gap === 1) {
      state.currentStreak += 1;
      state.longestStreak = Math.max(state.longestStreak, state.currentStreak);
      state.lastActiveDate = today;
      updated = true;
    } else {
      // missed a day, reset
      state.currentStreak = 1; // counts today as day 1
      state.lastActiveDate = today;
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
    if (bonusXP > 0) {
      const currentXP = Number(user.totalXP || 0);
      user.totalXP = currentXP + bonusXP;
    }
    localStorage.setItem('byteclub_user', JSON.stringify(user));
  } catch {}

  return { updated, state, bonusXP };
}


