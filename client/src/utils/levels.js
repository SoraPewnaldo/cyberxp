// Level thresholds — matches server/utils/levels.js
const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 250 },
  { level: 4, xp: 500 },
  { level: 5, xp: 1000 },
];

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

export function getXPForNextLevel(currentLevel) {
  const nextThreshold = LEVEL_THRESHOLDS.find((t) => t.level === currentLevel + 1);
  return nextThreshold ? nextThreshold.xp : null;
}

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

export function getLevelTitle(level) {
  const titles = {
    1: 'Script Kiddie',
    2: 'Apprentice',
    3: 'Hacker',
    4: 'Expert',
    5: 'Elite Hacker',
  };
  return titles[level] || 'Unknown';
}

export { LEVEL_THRESHOLDS };
