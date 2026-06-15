// Level thresholds — XP required for each level
const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 250 },
  { level: 4, xp: 500 },
  { level: 5, xp: 1000 },
];

/**
 * Get the current level from XP
 * @param {number} xp - Total XP
 * @returns {number} Current level
 */
export function getLevelFromXP(xp) {
  let currentLevel = 1;
  for (const threshold of LEVEL_THRESHOLDS) {
    if (xp >= threshold.xp) {
      currentLevel = threshold.level;
    } else {
      break;
    }
  }
  return currentLevel;
}

/**
 * Get the XP required for the next level
 * @param {number} currentLevel - Current level
 * @returns {number|null} XP threshold for next level, or null if max level
 */
export function getXPForNextLevel(currentLevel) {
  const nextThreshold = LEVEL_THRESHOLDS.find((t) => t.level === currentLevel + 1);
  return nextThreshold ? nextThreshold.xp : null;
}

/**
 * Get progress percentage toward next level
 * @param {number} xp - Total XP
 * @returns {{ level: number, progress: number, currentXP: number, nextLevelXP: number|null, xpInLevel: number, xpNeeded: number }}
 */
export function getLevelProgress(xp) {
  const level = getLevelFromXP(xp);
  const currentLevelXP = LEVEL_THRESHOLDS.find((t) => t.level === level)?.xp || 0;
  const nextLevelXP = getXPForNextLevel(level);

  if (nextLevelXP === null) {
    return { level, progress: 100, currentXP: xp, nextLevelXP: null, xpInLevel: 0, xpNeeded: 0 };
  }

  const xpInLevel = xp - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const progress = Math.min(Math.round((xpInLevel / xpNeeded) * 100), 100);

  return { level, progress, currentXP: xp, nextLevelXP, xpInLevel, xpNeeded };
}

export { LEVEL_THRESHOLDS };
