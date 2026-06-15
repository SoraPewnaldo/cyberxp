import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'cyberxp.db');

const db = new DatabaseSync(DB_PATH);

const ACHIEVEMENTS = [
  // Existing 12
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

  // New 38 Achievements
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

console.log('Inserting 50 achievements...');

const insert = db.prepare(
  'INSERT INTO achievements (title, description, icon, unlocked) VALUES (?, ?, ?, 0)'
);

const check = db.prepare('SELECT id FROM achievements WHERE title = ?');

let added = 0;
for (const a of ACHIEVEMENTS) {
  const exists = check.get(a.title);
  if (!exists) {
    insert.run(a.title, a.description, a.icon);
    added++;
  }
}

console.log(`Successfully added ${added} new achievements! Total in DB should be 50.`);
