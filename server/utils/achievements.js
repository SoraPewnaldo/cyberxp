import pool from '../config/db.js';
import { getLevelFromXP } from './levels.js';

/**
 * Check and unlock achievements after a room is completed.
 * All achievements that should now be unlocked are updated in a single pass.
 *
 * @param {object} settings - Current settings row from PostgreSQL
 * @returns {Promise<Array>} Newly unlocked achievement rows
 */
export async function checkAndUnlockAchievements(settings) {
  // Only look at still-locked achievements
  const lockedRes = await pool.query('SELECT * FROM achievements WHERE unlocked = 0');
  const locked = lockedRes.rows;
  if (locked.length === 0) return [];

  // Pull stats we need
  const completedTotalRes = await pool.query(
    "SELECT COUNT(*) AS n FROM rooms WHERE status = 'Completed'"
  );
  const completedTotal = parseInt(completedTotalRes.rows[0].n, 10);

  const categoryRowsRes = await pool.query(`
    SELECT category, COUNT(*) AS n
    FROM rooms WHERE status = 'Completed'
    GROUP BY category
  `);
  const categoryRows = categoryRowsRes.rows;

  const catMap = {};
  categoryRows.forEach((r) => (catMap[r.category] = parseInt(r.n, 10)));

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
      
      // New 38 Achievements logic
      case 'Century Mark':        shouldUnlock = completedTotal >= 100;                       break;
      case 'Two Hundred Club':    shouldUnlock = completedTotal >= 200;                       break;
      case 'God Mode':            shouldUnlock = completedTotal >= 500;                       break;
      case 'Linux Guru':          shouldUnlock = (catMap['Linux']            || 0) >= 25;     break;
      case 'Web Master':          shouldUnlock = (catMap['Web']              || 0) >= 25;     break;
      case 'Network God':         shouldUnlock = (catMap['Networking']       || 0) >= 25;     break;
      case 'Rooted':              shouldUnlock = (catMap['PrivEsc']          || 0) >= 25;     break;
      case 'Domain Admin':        shouldUnlock = (catMap['Active Directory'] || 0) >= 25;     break;
      case 'Windows Wizard':      shouldUnlock = (catMap['Windows']          || 0) >= 25;     break;
      case 'Crypto Cracker':      shouldUnlock = (catMap['Cryptography']     || 0) >= 5;      break;
      case 'Cipher Master':       shouldUnlock = (catMap['Cryptography']     || 0) >= 20;     break;
      case 'Forensics Finder':    shouldUnlock = (catMap['Forensics']        || 0) >= 5;      break;
      case 'Sherlock Holmes':     shouldUnlock = (catMap['Forensics']        || 0) >= 20;     break;
      case 'CTF Player':          shouldUnlock = (catMap['CTF']              || 0) >= 5;      break;
      case 'Capture The Flag':    shouldUnlock = (catMap['CTF']              || 0) >= 20;     break;
      case 'Malware Analyst':     shouldUnlock = (catMap['Malware']          || 0) >= 5;      break;
      case 'Reverse Engineer':    shouldUnlock = (catMap['Reverse Eng']      || 0) >= 5;      break;
      case 'Bug Hunter':          shouldUnlock = (catMap['Web Security']     || 0) >= 10;     break;
      case 'Cloud Defender':      shouldUnlock = (catMap['Cloud Security']   || 0) >= 5;      break;
      case 'Hardware Hacker':     shouldUnlock = (catMap['Hardware']         || 0) >= 5;      break;
      case 'OSINT Gatherer':      shouldUnlock = (catMap['OSINT']            || 0) >= 5;      break;
      case 'Shadow Broker':       shouldUnlock = (catMap['OSINT']            || 0) >= 15;     break;
      case 'Script Kiddie':       shouldUnlock = level >= 2;                                  break;
      case '1337 H4X0R':          shouldUnlock = level >= 10;                                 break;
      case 'Grandmaster':         shouldUnlock = level >= 50;                                 break;
      case 'XP Hoarder':          shouldUnlock = settings.xp >= 5000;                        break;
      case 'XP Millionaire':      shouldUnlock = settings.xp >= 100000;                      break;
      case 'Two Week Streak':     shouldUnlock = settings.streak >= 14;                       break;
      case 'Monthly Regular':     shouldUnlock = settings.streak >= 30;                       break;
      case 'Quarterly Dedicated': shouldUnlock = settings.streak >= 90;                       break;
      case 'One Year Strong':     shouldUnlock = settings.streak >= 365;                      break;
      case 'Pcap Parser':         shouldUnlock = (catMap['Networking']       || 0) >= 10;     break; // approximate mapping if specific network subcategories aren't distinct
      case 'Buffer Overflow':     shouldUnlock = (catMap['PrivEsc']          || 0) >= 5;      break;
      case 'SQL Injector':        shouldUnlock = (catMap['Web']              || 0) >= 10;     break;
      case 'XSS Exploiter':       shouldUnlock = (catMap['Web']              || 0) >= 10;     break;
      case 'Hash Cracker':        shouldUnlock = (catMap['Cryptography']     || 0) >= 10;     break;
      case 'Social Engineer':     shouldUnlock = (catMap['General']          || 0) >= 5;      break; // Phishing mapped to General/Web
      case 'Red Teamer':          shouldUnlock = completedTotal >= 25;                        break;
      case 'Blue Teamer':         shouldUnlock = completedTotal >= 25;                        break;
      case 'Zero Day':            shouldUnlock = completedTotal >= 1;                         break;
    }

    if (shouldUnlock) {
      await pool.query(
        'UPDATE achievements SET unlocked = 1, unlockedAt = $1 WHERE id = $2',
        [now, achievement.id]
      );

      newlyUnlocked.push({ ...achievement, unlocked: 1, unlockedAt: now });
    }
  }

  return newlyUnlocked;
}
