import axios from 'axios';
import roomsData from '../assets/rooms.json';

// Local Storage Keys
const SETTINGS_KEY = 'cyberxp_settings';
const ROOMS_KEY = 'cyberxp_rooms_status';
const ACHIEVEMENTS_KEY = 'cyberxp_achievements_status';
const ACTIVITIES_KEY = 'cyberxp_activities_log';

// Achievement Database Definition (50 Achievements)
const ACHIEVEMENTS_DEF = [
  { id: 1, title: 'First Blood', description: 'Complete your first room', icon: '🩸' },
  { id: 2, title: 'Decadent', description: 'Complete 10 rooms', icon: '⚡' },
  { id: 3, title: 'Half Century', description: 'Complete 50 rooms', icon: '🎯' },
  { id: 4, title: 'Linux Beginner', description: 'Complete 5 Linux rooms', icon: '🐧' },
  { id: 5, title: 'Web Explorer', description: 'Complete 5 Web rooms', icon: '🌐' },
  { id: 6, title: 'Network Ninja', description: 'Complete 5 Networking rooms', icon: '🌍' },
  { id: 7, title: 'Privilege Escalator', description: 'Complete 5 PrivEsc rooms', icon: '🪜' },
  { id: 8, title: 'AD Dominator', description: 'Complete 5 Active Directory rooms', icon: '🏢' },
  { id: 9, title: 'Windows Warrior', description: 'Complete 5 Windows rooms', icon: '🪟' },
  { id: 10, title: 'Streak Master', description: 'Reach a 7-day streak', icon: '🔥' },
  { id: 11, title: 'XP Hunter', description: 'Earn 500 XP', icon: '💰' },
  { id: 12, title: 'Elite Hacker', description: 'Reach Level 5', icon: '🏴‍☠️' },
  { id: 13, title: 'Century Mark', description: 'Complete 100 rooms', icon: '💯' },
  { id: 14, title: 'Two Hundred Club', description: 'Complete 200 rooms', icon: '🥈' },
  { id: 15, title: 'God Mode', description: 'Complete 500 rooms', icon: '🥇' },
  { id: 16, title: 'Linux Guru', description: 'Complete 25 Linux rooms', icon: '🐧' },
  { id: 17, title: 'Web Master', description: 'Complete 25 Web rooms', icon: '🕸️' },
  { id: 18, title: 'Network God', description: 'Complete 25 Networking rooms', icon: '📡' },
  { id: 19, title: 'Rooted', description: 'Complete 25 PrivEsc rooms', icon: '🛡️' },
  { id: 20, title: 'Domain Admin', description: 'Complete 25 AD rooms', icon: '👑' },
  { id: 21, title: 'Windows Wizard', description: 'Complete 25 Windows rooms', icon: '🖥️' },
  { id: 22, title: 'Crypto Cracker', description: 'Complete 5 Cryptography rooms', icon: '🔐' },
  { id: 23, title: 'Cipher Master', description: 'Complete 20 Cryptography rooms', icon: '🗝️' },
  { id: 24, title: 'Forensics Finder', description: 'Complete 5 Forensics rooms', icon: '🔍' },
  { id: 25, title: 'Sherlock Holmes', description: 'Complete 20 Forensics rooms', icon: '🕵️' },
  { id: 26, title: 'CTF Player', description: 'Complete 5 CTF rooms', icon: '🚩' },
  { id: 27, title: 'Capture The Flag', description: 'Complete 20 CTF rooms', icon: '🏴' },
  { id: 28, title: 'Malware Analyst', description: 'Complete 5 Malware rooms', icon: '🦠' },
  { id: 29, title: 'Reverse Engineer', description: 'Complete 5 Reverse Eng rooms', icon: '⚙️' },
  { id: 30, title: 'Bug Hunter', description: 'Complete 10 Web Security rooms', icon: '🐛' },
  { id: 31, title: 'Cloud Defender', description: 'Complete 5 Cloud Security rooms', icon: '☁️' },
  { id: 32, title: 'Hardware Hacker', description: 'Complete 5 Hardware rooms', icon: '🔌' },
  { id: 33, title: 'OSINT Gatherer', description: 'Complete 5 OSINT rooms', icon: '👁️' },
  { id: 34, title: 'Shadow Broker', description: 'Complete 15 OSINT rooms', icon: '🥷' },
  { id: 35, title: 'Script Kiddie', description: 'Reach Level 2', icon: '🍼' },
  { id: 36, title: '1337 H4X0R', description: 'Reach Level 10', icon: '🤖' },
  { id: 37, title: 'Grandmaster', description: 'Reach Level 50', icon: '🧙‍♂️' },
  { id: 38, title: 'XP Hoarder', description: 'Earn 5,000 XP', icon: '💎' },
  { id: 39, title: 'XP Millionaire', description: 'Earn 100,000 XP', icon: '🏦' },
  { id: 40, title: 'Two Week Streak', description: 'Reach a 14-day streak', icon: '📅' },
  { id: 41, title: 'Monthly Regular', description: 'Reach a 30-day streak', icon: '📆' },
  { id: 42, title: 'Quarterly Dedicated', description: 'Reach a 90-day streak', icon: '🗓️' },
  { id: 43, title: 'One Year Strong', description: 'Reach a 365-day streak', icon: '🏆' },
  { id: 44, title: 'Pcap Parser', description: 'Analyze 10 network captures', icon: '🦈' },
  { id: 45, title: 'Buffer Overflow', description: 'Exploit 5 BoF vulnerabilities', icon: '💥' },
  { id: 46, title: 'SQL Injector', description: 'Drop tables in 10 rooms', icon: '💉' },
  { id: 47, title: 'XSS Exploiter', description: 'Steal cookies in 10 rooms', icon: '🍪' },
  { id: 48, title: 'Hash Cracker', description: 'Crack 100 hashes', icon: '⚡' },
  { id: 49, title: 'Social Engineer', description: 'Complete 5 Phishing rooms', icon: '🎣' },
  { id: 50, title: 'Red Teamer', description: 'Complete 25 Offensive rooms', icon: '🛑' },
  { id: 51, title: 'Blue Teamer', description: 'Complete 25 Defensive rooms', icon: '🛡️' },
  { id: 52, title: 'Zero Day', description: 'Discover your first 0-day', icon: '☢️' }
];

// Helper: Get Settings
function getLocalSettings() {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (data) return JSON.parse(data);
  const defaults = { displayName: 'User', avatar: '🛡️', xp: 0, streak: 0, lastCompletionDate: null };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaults));
  return defaults;
}

// Helper: Get Rooms with status
function getLocalRooms() {
  const statusMap = JSON.parse(localStorage.getItem(ROOMS_KEY) || '{}');
  return roomsData.map((room) => ({
    ...room,
    status: statusMap[room.id] || 'Not Started'
  }));
}

// Helper: Save Room Status
function saveRoomStatus(roomId, status) {
  const statusMap = JSON.parse(localStorage.getItem(ROOMS_KEY) || '{}');
  statusMap[roomId] = status;
  localStorage.setItem(ROOMS_KEY, JSON.stringify(statusMap));
}

// Helper: Get Achievements status
function getLocalAchievements() {
  const statusMap = JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY) || '{}');
  return ACHIEVEMENTS_DEF.map((ach) => ({
    ...ach,
    unlocked: statusMap[ach.id]?.unlocked ? 1 : 0,
    unlockedAt: statusMap[ach.id]?.unlockedAt || null
  }));
}

// Helper: Get Activity logs
function getLocalActivities() {
  return JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]');
}

// Helper: Log Activity
function logActivity(action, xp) {
  const logs = getLocalActivities();
  const newLog = {
    id: Date.now() + Math.random(),
    action,
    xp,
    date: new Date().toISOString()
  };
  logs.unshift(newLog); // Prepend
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(logs.slice(0, 100))); // Keep last 100
}

// Level helper (cloned from client levels.js)
const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 250 },
  { level: 4, xp: 500 },
  { level: 5, xp: 1000 }
];
function getLevelFromXP(xp) {
  let level = 1;
  for (const t of LEVEL_THRESHOLDS) {
    if (xp >= t.xp) level = t.level;
    else break;
  }
  return level;
}

// Check and unlock achievements
function checkAchievements(settings, rooms) {
  const statusMap = JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY) || '{}');
  const completedRooms = rooms.filter(r => r.status === 'Completed');
  const completedCount = completedRooms.length;

  const catMap = {};
  completedRooms.forEach((r) => {
    catMap[r.category] = (catMap[r.category] || 0) + 1;
  });

  const level = getLevelFromXP(settings.xp);
  const now = new Date().toISOString();
  const newlyUnlocked = [];

  ACHIEVEMENTS_DEF.forEach((ach) => {
    if (statusMap[ach.id]?.unlocked) return; // Skip already unlocked

    let shouldUnlock = false;
    switch (ach.title) {
      case 'First Blood':         shouldUnlock = completedCount >= 1; break;
      case 'Decadent':            shouldUnlock = completedCount >= 10; break;
      case 'Half Century':        shouldUnlock = completedCount >= 50; break;
      case 'Linux Beginner':      shouldUnlock = (catMap['Linux'] || 0) >= 5; break;
      case 'Web Explorer':        shouldUnlock = (catMap['Web'] || 0) >= 5; break;
      case 'Network Ninja':       shouldUnlock = (catMap['Networking'] || 0) >= 5; break;
      case 'Privilege Escalator': shouldUnlock = (catMap['PrivEsc'] || 0) >= 5; break;
      case 'AD Dominator':        shouldUnlock = (catMap['Active Directory'] || 0) >= 5; break;
      case 'Windows Warrior':     shouldUnlock = (catMap['Windows'] || 0) >= 5; break;
      case 'Streak Master':       shouldUnlock = settings.streak >= 7; break;
      case 'XP Hunter':           shouldUnlock = settings.xp >= 500; break;
      case 'Elite Hacker':        shouldUnlock = level >= 5; break;
      case 'Century Mark':        shouldUnlock = completedCount >= 100; break;
      case 'Two Hundred Club':    shouldUnlock = completedCount >= 200; break;
      case 'God Mode':            shouldUnlock = completedCount >= 500; break;
      case 'Linux Guru':          shouldUnlock = (catMap['Linux'] || 0) >= 25; break;
      case 'Web Master':          shouldUnlock = (catMap['Web'] || 0) >= 25; break;
      case 'Network God':         shouldUnlock = (catMap['Networking'] || 0) >= 25; break;
      case 'Rooted':              shouldUnlock = (catMap['PrivEsc'] || 0) >= 25; break;
      case 'Domain Admin':        shouldUnlock = (catMap['Active Directory'] || 0) >= 25; break;
      case 'Windows Wizard':      shouldUnlock = (catMap['Windows'] || 0) >= 25; break;
      case 'Crypto Cracker':      shouldUnlock = (catMap['Cryptography'] || 0) >= 5; break;
      case 'Cipher Master':       shouldUnlock = (catMap['Cryptography'] || 0) >= 20; break;
      case 'Forensics Finder':    shouldUnlock = (catMap['Forensics'] || 0) >= 5; break;
      case 'Sherlock Holmes':     shouldUnlock = (catMap['Forensics'] || 0) >= 20; break;
      case 'CTF Player':          shouldUnlock = (catMap['CTF'] || 0) >= 5; break;
      case 'Capture The Flag':    shouldUnlock = (catMap['CTF'] || 0) >= 20; break;
      case 'Script Kiddie':       shouldUnlock = level >= 2; break;
      case '1337 H4X0R':          shouldUnlock = level >= 10; break;
      case 'Grandmaster':         shouldUnlock = level >= 50; break;
      case 'XP Hoarder':          shouldUnlock = settings.xp >= 5000; break;
      case 'XP Millionaire':      shouldUnlock = settings.xp >= 100000; break;
      case 'Two Week Streak':     shouldUnlock = settings.streak >= 14; break;
      case 'Monthly Regular':     shouldUnlock = settings.streak >= 30; break;
      case 'Quarterly Dedicated': shouldUnlock = settings.streak >= 90; break;
      case 'One Year Strong':     shouldUnlock = settings.streak >= 365; break;
    }

    if (shouldUnlock) {
      statusMap[ach.id] = { unlocked: true, unlockedAt: now };
      newlyUnlocked.push({ ...ach, unlocked: 1, unlockedAt: now });
    }
  });

  if (newlyUnlocked.length > 0) {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(statusMap));
  }
  return newlyUnlocked;
}

// Live Axios Client
const API = axios.create({
  baseURL: import.meta.env.DEV ? '/api' : 'https://cyberxp-backend.onrender.com/api'
});

export default API;
