/**
 * CyberXP PostgreSQL Database — Initialization
 *
 * Uses the 'pg' module to connect to a PostgreSQL database.
 */

import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// ─────────────────────────────────────────────────────────────
// Default Records Helpers
// ─────────────────────────────────────────────────────────────

async function ensureSettings() {
  const existing = await pool.query('SELECT id FROM settings WHERE id = 1');
  if (existing.rows.length === 0) {
    await pool.query(`
      INSERT INTO settings (id, displayName, avatar, xp, streak, appVersion, seeded)
      VALUES (1, 'User', '🛡️', 0, 0, '1.0.0', 0)
      ON CONFLICT (id) DO NOTHING
    `);
  }
}

async function seedAchievementsIfEmpty() {
  const countRes = await pool.query('SELECT COUNT(*) AS n FROM achievements');
  const count = parseInt(countRes.rows[0].n, 10);
  if (count > 0) return;

  const ACHIEVEMENTS = [
    { title: 'First Blood',         description: 'Complete your first room',          icon: '🩸' },
    { title: 'Decadent',            description: 'Complete 10 rooms',                 icon: '⚡' },
    { title: 'Half Century',        description: 'Complete 50 rooms',                 icon: '🎯' },
    { title: 'Linux Beginner',      description: 'Complete 5 Linux rooms',            icon: '🐧' },
    { title: 'Web Explorer',        description: 'Complete 5 Web rooms',              icon: '🌐' },
    { title: 'Network Ninja',       description: 'Complete 5 Networking rooms',       icon: '🌍' },
    { title: 'Privilege Escalator', description: 'Complete 5 PrivEsc rooms',          icon: '🪜' },
    { title: 'AD Dominator',        description: 'Complete 5 Active Directory rooms', icon: '🏢' },
    { title: 'Windows Warrior',     description: 'Complete 5 Windows rooms',          icon: '🪟' },
    { title: 'Streak Master',       description: 'Reach a 7-day streak',              icon: '🔥' },
    { title: 'XP Hunter',           description: 'Earn 500 XP',                       icon: '💰' },
    { title: 'Elite Hacker',        description: 'Reach Level 5',                     icon: '🏴‍☠️' },

    { title: 'Century Mark',        description: 'Complete 100 rooms',                icon: '💯' },
    { title: 'Two Hundred Club',    description: 'Complete 200 rooms',                icon: '🥈' },
    { title: 'God Mode',            description: 'Complete 500 rooms',                icon: '🥇' },
    { title: 'Linux Guru',          description: 'Complete 25 Linux rooms',           icon: '🐧' },
    { title: 'Web Master',          description: 'Complete 25 Web rooms',             icon: '🕸️' },
    { title: 'Network God',         description: 'Complete 25 Networking rooms',      icon: '📡' },
    { title: 'Rooted',              description: 'Complete 25 PrivEsc rooms',         icon: '🛡️' },
    { title: 'Domain Admin',        description: 'Complete 25 AD rooms',              icon: '👑' },
    { title: 'Windows Wizard',      description: 'Complete 25 Windows rooms',         icon: '🖥️' },
    { title: 'Crypto Cracker',      description: 'Complete 5 Cryptography rooms',     icon: '🔐' },
    { title: 'Cipher Master',       description: 'Complete 20 Cryptography rooms',    icon: '🗝️' },
    { title: 'Forensics Finder',    description: 'Complete 5 Forensics rooms',        icon: '🔍' },
    { title: 'Sherlock Holmes',     description: 'Complete 20 Forensics rooms',       icon: '🕵️' },
    { title: 'CTF Player',          description: 'Complete 5 CTF rooms',              icon: '🚩' },
    { title: 'Capture The Flag',    description: 'Complete 20 CTF rooms',             icon: '🏴' },
    { title: 'Malware Analyst',     description: 'Complete 5 Malware rooms',          icon: '🦠' },
    { title: 'Reverse Engineer',    description: 'Complete 5 Reverse Eng rooms',      icon: '⚙️' },
    { title: 'Bug Hunter',          description: 'Complete 10 Web Security rooms',    icon: '🐛' },
    { title: 'Cloud Defender',      description: 'Complete 5 Cloud Security rooms',   icon: '☁️' },
    { title: 'Hardware Hacker',     description: 'Complete 5 Hardware rooms',         icon: '🔌' },
    { title: 'OSINT Gatherer',      description: 'Complete 5 OSINT rooms',            icon: '👁️' },
    { title: 'Shadow Broker',       description: 'Complete 15 OSINT rooms',           icon: '🥷' },
    { title: 'Script Kiddie',       description: 'Reach Level 2',                     icon: '🍼' },
    { title: '1337 H4X0R',          description: 'Reach Level 10',                    icon: '🤖' },
    { title: 'Grandmaster',         description: 'Reach Level 50',                    icon: '🧙‍♂️' },
    { title: 'XP Hoarder',          description: 'Earn 5,000 XP',                     icon: '💎' },
    { title: 'XP Millionaire',      description: 'Earn 100,000 XP',                   icon: '🏦' },
    { title: 'Two Week Streak',     description: 'Reach a 14-day streak',             icon: '📅' },
    { title: 'Monthly Regular',     description: 'Reach a 30-day streak',             icon: '📆' },
    { title: 'Quarterly Dedicated', description: 'Reach a 90-day streak',             icon: '🗓️' },
    { title: 'One Year Strong',     description: 'Reach a 365-day streak',            icon: '🏆' },
    { title: 'Pcap Parser',         description: 'Analyze 10 network captures',       icon: '🦈' },
    { title: 'Buffer Overflow',     description: 'Exploit 5 BoF vulnerabilities',     icon: '💥' },
    { title: 'SQL Injector',        description: 'Drop tables in 10 rooms',           icon: '💉' },
    { title: 'XSS Exploiter',       description: 'Steal cookies in 10 rooms',         icon: '🍪' },
    { title: 'Hash Cracker',        description: 'Crack 100 hashes',                  icon: '⚡' },
    { title: 'Social Engineer',     description: 'Complete 5 Phishing rooms',         icon: '🎣' },
    { title: 'Red Teamer',          description: 'Complete 25 Offensive rooms',       icon: '🛑' },
    { title: 'Blue Teamer',         description: 'Complete 25 Defensive rooms',       icon: '🛡️' },
    { title: 'Zero Day',            description: 'Discover your first 0-day',         icon: '☢️' }
  ];

  for (const a of ACHIEVEMENTS) {
    await pool.query(
      'INSERT INTO achievements (title, description, icon, unlocked) VALUES ($1, $2, $3, 0)',
      [a.title, a.description, a.icon]
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Main Init — called once at startup
// ─────────────────────────────────────────────────────────────

export async function initializeDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id                 INTEGER PRIMARY KEY DEFAULT 1,
      displayName        TEXT    DEFAULT 'User',
      avatar             TEXT    DEFAULT '🛡️',
      xp                 INTEGER DEFAULT 0,
      streak             INTEGER DEFAULT 0,
      lastCompletionDate TEXT,
      appVersion         TEXT    DEFAULT '1.0.0',
      seeded             INTEGER DEFAULT 0,
      createdAt          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      id            SERIAL PRIMARY KEY,
      roomName      TEXT    UNIQUE NOT NULL,
      category      TEXT    DEFAULT 'General',
      path          TEXT    DEFAULT 'General',
      difficulty    TEXT    DEFAULT 'Easy',
      url           TEXT    DEFAULT '',
      status        TEXT    DEFAULT 'Not Started',
      xpReward      INTEGER DEFAULT 10,
      priorityScore INTEGER DEFAULT 0,
      roadmapOrder  INTEGER DEFAULT 999,
      createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS achievements (
      id          SERIAL PRIMARY KEY,
      title       TEXT NOT NULL,
      description TEXT,
      icon        TEXT DEFAULT '🏆',
      unlocked    INTEGER DEFAULT 0,
      unlockedAt  TEXT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id        SERIAL PRIMARY KEY,
      action    TEXT NOT NULL,
      xp        INTEGER DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await ensureSettings();
  await seedAchievementsIfEmpty();

  // Seed rooms from README on very first run (seeded flag = 0)
  const settingsRes = await pool.query('SELECT seeded FROM settings WHERE id = 1');
  const settings = settingsRes.rows[0];
  if (!settings || !settings.seeded) {
    try {
      const { seedRoomsFromReadme } = await import('../scripts/seedRooms.js');
      const count = await seedRoomsFromReadme(pool);
      await pool.query("UPDATE settings SET seeded = 1, updatedAt = CURRENT_TIMESTAMP WHERE id = 1");
      console.log(`📚 Seeded ${count} rooms from TryHackMe README`);
    } catch (err) {
      console.warn('⚠️  Could not auto-seed rooms:', err.message);
    }
  }

  console.log(`✅ CyberXP PostgreSQL DB ready`);
}

export default pool;
