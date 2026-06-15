import fs from 'fs';
import path from 'path';

const readmePath = path.resolve('d:/Projects/New Web app/Tryhackme readme/README.md');
const content = fs.readFileSync(readmePath, 'utf-8');

const lines = content.split('\n');
const rooms = [];
let currentPath = 'General';
let currentDifficulty = 'Easy';
let order = 1;

for (const line of lines) {
  if (line.startsWith('## ')) {
    currentPath = line.replace('##', '').trim();
    // Guess difficulty from path if it has CTF
    if (currentPath.toLowerCase().includes('medium')) currentDifficulty = 'Medium';
    else if (currentPath.toLowerCase().includes('hard') || currentPath.toLowerCase().includes('insane')) currentDifficulty = 'Hard';
    else if (currentPath.toLowerCase().includes('easy')) currentDifficulty = 'Easy';
  }

  // match: - [ ] [🕵️ TryHackMe | Room Name](url)
  // or - [x] [🕵️ TryHackMe | Room Name](url)
  // or sometimes it might not have 🕵️ TryHackMe |
  const match = line.match(/- \[[ x]\] \[(?:.*?\|\s*)?(.*?)\]\((.*?)\)/);
  if (match) {
    let roomName = match[1].trim();
    let url = match[2].trim();
    
    // map category
    let category = 'General';
    const lowerPath = currentPath.toLowerCase();
    if (lowerPath.includes('linux')) category = 'Linux';
    else if (lowerPath.includes('windows')) category = 'Windows';
    else if (lowerPath.includes('network') || lowerPath.includes('pcap') || lowerPath.includes('wifi')) category = 'Networking';
    else if (lowerPath.includes('web')) category = 'Web';
    else if (lowerPath.includes('privesc') || lowerPath.includes('privilege')) category = 'PrivEsc';
    else if (lowerPath.includes('active directory')) category = 'Active Directory';
    else if (lowerPath.includes('ctf')) category = 'CTF';
    else if (lowerPath.includes('forensic')) category = 'Forensics';
    else if (lowerPath.includes('crypto')) category = 'Cryptography';

    rooms.push({
      roomName,
      url,
      path: currentPath,
      category,
      difficulty: currentDifficulty,
      roadmapOrder: order++
    });
  }
}

console.log(`Parsed ${rooms.length} rooms`);
const categories = new Set(rooms.map(r => r.category));
console.log(`Categories:`, Array.from(categories));
const paths = new Set(rooms.map(r => r.path));
console.log(`Paths:`, Array.from(paths));
