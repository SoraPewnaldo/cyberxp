import db from '../config/db.js';
import { getLevelFromXP } from './levels.js';

/**
 * Check and unlock achievements after a room is completed.
 * All achievements that should now be unlocked are updated in a single pass.
 *
 * @param {object} settings - Current settings row from SQLite
 * @returns {Array} Newly unlocked achievement rows
 */
export function checkAndUnlockAchievements(settings) {
  // Only look at still-locked achievements
  const locked = db.prepare('SELECT * FROM achievements WHERE unlocked = 0').all();
  if (locked.length === 0) return [];

  // Pull stats we need
  const completedTotal = db.prepare(
    "SELECT COUNT(*) AS n FROM rooms WHERE status = 'Completed'"
  ).get().n;

  const categoryRows = db.prepare(`
    SELECT category, COUNT(*) AS n
    FROM rooms WHERE status = 'Completed'
    GROUP BY category
  `).all();

  const catMap = {};
  categoryRows.forEach((r) => (catMap[r.category] = r.n));

  const level = getLevelFromXP(settings.xp);
  const now   = new Date().toISOString();
  const newlyUnlocked = [];

  for (const achievement of locked) {
    let shouldUnlock = false;

    switch (achievement.title) {
      case 'First Blood':         shouldUnlock = completedTotal >= 1;                         break;
      case 'Decadent':            shouldUnlock = completedTotal >= 10;                        break;
      case 'Half Century':        shouldUnlock = completedTotal >= 50;                        break;
      case 'Linux Beginner':      shouldUnlock = (catMap['Linux']            || 0) >= 5;      break;
      case 'Web Explorer':        shouldUnlock = (catMap['Web']              || 0) >= 5;      break;
      case 'Network Ninja':       shouldUnlock = (catMap['Networking']       || 0) >= 5;      break;
      case 'Privilege Escalator': shouldUnlock = (catMap['PrivEsc']          || 0) >= 5;      break;
      case 'AD Dominator':        shouldUnlock = (catMap['Active Directory'] || 0) >= 5;      break;
      case 'Windows Warrior':     shouldUnlock = (catMap['Windows']          || 0) >= 5;      break;
      case 'Streak Master':       shouldUnlock = settings.streak >= 7;                        break;
      case 'XP Hunter':           shouldUnlock = settings.xp >= 500;                         break;
      case 'Elite Hacker':        shouldUnlock = level >= 5;                                  break;
    }

    if (shouldUnlock) {
      db.prepare(`
        UPDATE achievements SET unlocked = 1, unlockedAt = ? WHERE id = ?
      `).run(now, achievement.id);

      newlyUnlocked.push({ ...achievement, unlocked: 1, unlockedAt: now });
    }
  }

  return newlyUnlocked;
}
