/**
 * CyberXP — Seed rooms from TryHackMe README into SQLite
 *
 * Parses:  Tryhackme readme/README.md
 * Inserts: rooms table (skips duplicates by roomName)
 *
 * Usage:
 *   Automatic — called on first startup when seeded = 0
 *   Manual    — node scripts/seedRooms.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const README_PATH = path.resolve(__dirname, '../../Tryhackme readme/README.md');

// XP reward by difficulty
const XP_REWARDS = { Easy: 10, Medium: 25, Hard: 50 };

/**
 * Determine category from section heading
 */
function getCategory(sectionPath) {
  const lower = sectionPath.toLowerCase();
  if (lower.includes('linux'))            return 'Linux';
  if (lower.includes('windows'))          return 'Windows';
  if (lower.includes('network') || lower.includes('pcap') || lower.includes('wifi')) return 'Networking';
  if (lower.includes('web'))              return 'Web';
  if (lower.includes('privesc') || lower.includes('privilege')) return 'PrivEsc';
  if (lower.includes('active directory')) return 'Active Directory';
  if (lower.includes('ctf'))              return 'CTF';
  if (lower.includes('forensic'))         return 'Forensics';
  if (lower.includes('crypto'))           return 'Cryptography';
  return 'General';
}

/**
 * Parse room entries from README.md
 * @returns {Array<object>} rooms
 */
function parseReadme() {
  const content = fs.readFileSync(README_PATH, 'utf-8');
  const lines   = content.split('\n');
  const rooms   = [];

  let currentSection   = 'General';
  let currentDifficulty = 'Easy';
  let order = 1;

  for (const line of lines) {
    // Section heading
    if (line.startsWith('## ')) {
      currentSection = line.replace('##', '').trim();
      const lower = currentSection.toLowerCase();
      if      (lower.includes('medium'))                        currentDifficulty = 'Medium';
      else if (lower.includes('hard') || lower.includes('insane')) currentDifficulty = 'Hard';
      else if (lower.includes('easy'))                          currentDifficulty = 'Easy';
    }

    // Room entry: - [ ] or - [x]
    const match = line.match(/- \[[ x]\] \[(?:.*?\|\s*)?(.*?)\]\((.*?)\)/);
    if (match) {
      const roomName = match[1].trim();
      const url      = match[2].trim();
      const category = getCategory(currentSection);
      const xpReward = XP_REWARDS[currentDifficulty] || 10;

      rooms.push({
        roomName,
        url,
        path: currentSection,
        category,
        difficulty: currentDifficulty,
        xpReward,
        roadmapOrder: order++,
      });
    }
  }

  return rooms;
}

/**
 * Insert rooms into the SQLite DB (skips duplicates by roomName)
 * @param {DatabaseSync} db
 * @returns {number} count of inserted rooms
 */
export function seedRoomsFromReadme(db) {
  const rooms = parseReadme();

  const insert = db.prepare(`
    INSERT OR IGNORE INTO rooms
      (roomName, category, path, difficulty, url, status, xpReward, roadmapOrder)
    VALUES
      (?, ?, ?, ?, ?, 'Not Started', ?, ?)
  `);

  // Deduplicate by roomName within the parsed list first
  const seen = new Set();
  let inserted = 0;

  for (const r of rooms) {
    if (seen.has(r.roomName)) continue;
    seen.add(r.roomName);

    const result = insert.run(
      r.roomName,
      r.category,
      r.path,
      r.difficulty,
      r.url,
      r.xpReward,
      r.roadmapOrder
    );
    inserted += result.changes;
  }

  return inserted;
}

// ─── Manual run: node scripts/seedRooms.js ───────────────────
// Only executes when the script is invoked directly
const isMain = process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMain) {
  const { DatabaseSync } = await import('node:sqlite');
  const { default: dbPath } = await import('../config/db.js');
  // Re-open db at the correct path
  const dbFilePath = path.resolve(__dirname, '../data/cyberxp.db');
  const db = new DatabaseSync(dbFilePath);

  const count = seedRoomsFromReadme(db);
  const skip  = parseReadme().length - count;
  console.log(`\n✅ Imported ${count} rooms`);
  console.log(`⏭️  Skipped  ${skip} duplicates\n`);

  // Summary by category
  const cats = db.prepare(`
    SELECT category, COUNT(*) AS n FROM rooms GROUP BY category ORDER BY n DESC
  `).all();
  console.log('Category breakdown:');
  for (const c of cats) console.log(`  ${c.category}: ${c.n}`);

  db.close();
}
