import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, '../data/cyberxp.db');
const OUTPUT_PATH = path.resolve(__dirname, '../../client/src/assets/rooms.json');

try {
  const db = new DatabaseSync(DB_PATH);
  const rooms = db.prepare('SELECT * FROM rooms ORDER BY roadmapOrder ASC, id ASC').all();
  
  // Clean rooms data (remove local progress status)
  const cleanRooms = rooms.map(r => ({
    id: r.id,
    roomName: r.roomName,
    category: r.category,
    path: r.path,
    difficulty: r.difficulty,
    url: r.url,
    xpReward: r.xpReward,
    roadmapOrder: r.roadmapOrder
  }));

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(cleanRooms, null, 2));
  console.log(`Successfully exported ${cleanRooms.length} rooms to ${OUTPUT_PATH}`);
} catch (err) {
  console.error('Export error:', err);
}
