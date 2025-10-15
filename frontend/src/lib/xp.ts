// Progressive XP thresholds with rollover logic

function roundToNearest50(value: number): number {
  return Math.round(value / 50) * 50;
}

export function buildXpThresholds(maxLevels: number = 100): number[] {
  const thresholds: number[] = [];
  // Raised thresholds for a more gamified curve (dashboard starts at 5000)
  thresholds[0] = 5000; // Level 1 -> 2
  thresholds[1] = roundToNearest50(thresholds[0] * 1.25); // ~3750
  thresholds[2] = roundToNearest50(thresholds[1] * 1.25); // ~4688 -> 4700
  for (let i = 3; i < maxLevels; i++) {
    const next = roundToNearest50(thresholds[i - 1] * 1.25);
    thresholds[i] = Math.max(thresholds[i - 1] + 50, next);
  }
  return thresholds;
}

const DEFAULT_THRESHOLDS = buildXpThresholds(200);

export interface LevelProgress {
  level: number; // current level number (starts at 1)
  currentXP: number; // XP into current level
  requiredXP: number; // XP needed to reach next level from current level
  percent: number; // 0-100
}

export function computeLevelProgress(totalXP: number, thresholds: number[] = DEFAULT_THRESHOLDS): LevelProgress {
  let level = 1;
  let remaining = Math.max(0, Math.floor(totalXP || 0));
  let idx = 0; // index in thresholds for current level -> next level requirement

  while (idx < thresholds.length && remaining >= thresholds[idx]) {
    remaining -= thresholds[idx];
    level += 1;
    idx += 1;
  }

  const requiredXP = thresholds[idx] ?? thresholds[thresholds.length - 1];
  const currentXP = remaining;
  const percent = Math.min(100, requiredXP > 0 ? (currentXP / requiredXP) * 100 : 0);

  return { level, currentXP, requiredXP, percent };
}


