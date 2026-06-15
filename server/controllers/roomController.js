import db from '../config/db.js';
import { checkAndUnlockAchievements } from '../utils/achievements.js';

// XP rewards by difficulty
const XP_REWARDS = { Easy: 10, Medium: 25, Hard: 50 };

/**
 * @desc    Get all rooms (with optional search / category / status / path filters)
 * @route   GET /api/rooms
 */
export const getRooms = (req, res) => {
  try {
    const { search, category, status, path } = req.query;

    let sql    = 'SELECT * FROM rooms WHERE 1=1';
    const params = [];

    if (category) { sql += ' AND category = ?'; params.push(category); }
    if (status)   { sql += ' AND status = ?';   params.push(status); }
    if (path)     { sql += ' AND path = ?';     params.push(path); }
    if (search)   { sql += ' AND roomName LIKE ?'; params.push(`%${search}%`); }

    sql += ' ORDER BY roadmapOrder ASC, id ASC';

    const rooms = db.prepare(sql).all(...params);
    res.json(rooms);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get single room by ID
 * @route   GET /api/rooms/:id
 */
export const getRoom = (req, res) => {
  try {
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Add a new room
 * @route   POST /api/rooms
 */
export const addRoom = (req, res) => {
  try {
    const { roomName, category, path, difficulty, url, status, roadmapOrder } = req.body;

    if (!roomName || !category || !difficulty) {
      return res.status(400).json({ message: 'Please provide roomName, category, and difficulty' });
    }

    const xpReward = XP_REWARDS[difficulty] || 10;

    const result = db.prepare(`
      INSERT INTO rooms (roomName, category, path, difficulty, url, status, xpReward, roadmapOrder)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      roomName,
      category,
      path      || 'General',
      difficulty,
      url       || '',
      status    || 'Not Started',
      xpReward,
      roadmapOrder || 999
    );

    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(room);
  } catch (error) {
    console.error('Add room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update a room
 * @route   PUT /api/rooms/:id
 */
export const updateRoom = (req, res) => {
  try {
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const { roomName, category, path, difficulty, url, status, roadmapOrder } = req.body;

    const updated = {
      roomName:     roomName     !== undefined ? roomName     : room.roomName,
      category:     category     !== undefined ? category     : room.category,
      path:         path         !== undefined ? path         : room.path,
      difficulty:   difficulty   !== undefined ? difficulty   : room.difficulty,
      url:          url          !== undefined ? url          : room.url,
      status:       status       !== undefined ? status       : room.status,
      roadmapOrder: roadmapOrder !== undefined ? roadmapOrder : room.roadmapOrder,
      xpReward:     difficulty   !== undefined ? (XP_REWARDS[difficulty] || room.xpReward) : room.xpReward,
    };

    db.prepare(`
      UPDATE rooms SET
        roomName = ?, category = ?, path = ?, difficulty = ?,
        url = ?, status = ?, xpReward = ?, roadmapOrder = ?
      WHERE id = ?
    `).run(
      updated.roomName, updated.category, updated.path, updated.difficulty,
      updated.url, updated.status, updated.xpReward, updated.roadmapOrder,
      Number(req.params.id)
    );

    const updatedRoom = db.prepare('SELECT * FROM rooms WHERE id = ?').get(Number(req.params.id));
    res.json(updatedRoom);
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete a room
 * @route   DELETE /api/rooms/:id
 */
export const deleteRoom = (req, res) => {
  try {
    const result = db.prepare('DELETE FROM rooms WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Room deleted' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Mark room as completed — award XP, update streak, check achievements, log activity
 * @route   PUT /api/rooms/:id/complete
 */
export const completeRoom = (req, res) => {
  try {
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.status === 'Completed') {
      return res.status(400).json({ message: 'Room is already completed' });
    }

    // Mark room completed
    db.prepare("UPDATE rooms SET status = 'Completed' WHERE id = ?").run(req.params.id);

    // Get / update settings
    let settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    const xpReward = room.xpReward;
    let newXP = settings.xp + xpReward;

    // Streak logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let newStreak = settings.streak;

    if (settings.lastCompletionDate) {
      const lastDate = new Date(settings.lastCompletionDate);
      lastDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 0)      { /* same day — no change */ }
      else if (diffDays === 1) { newStreak += 1; }   // consecutive
      else                     { newStreak = 1; }    // broken
    } else {
      newStreak = 1; // first completion
    }

    db.prepare(`
      UPDATE settings
      SET xp = ?, streak = ?, lastCompletionDate = ?, updatedAt = datetime('now')
      WHERE id = 1
    `).run(newXP, newStreak, new Date().toISOString());

    // Log activity
    db.prepare(`
      INSERT INTO activity_logs (action, xp) VALUES (?, ?)
    `).run(`Completed ${room.roomName}`, xpReward);

    // Reload settings for achievement check
    settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    const newlyUnlocked = checkAndUnlockAchievements(settings);

    res.json({
      room: db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id),
      xpAwarded: xpReward,
      totalXP: newXP,
      streak: newStreak,
      newAchievements: newlyUnlocked,
    });
  } catch (error) {
    console.error('Complete room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get dashboard stats summary
 * @route   GET /api/rooms/stats/summary
 */
export const getStatsSummary = (req, res) => {
  try {
    const total       = db.prepare("SELECT COUNT(*) AS n FROM rooms").get().n;
    const completed   = db.prepare("SELECT COUNT(*) AS n FROM rooms WHERE status = 'Completed'").get().n;
    const inProgress  = db.prepare("SELECT COUNT(*) AS n FROM rooms WHERE status = 'In Progress'").get().n;

    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      totalRooms: total,
      completedRooms: completed,
      inProgressRooms: inProgress,
      notStarted: total - completed - inProgress,
      completionPercentage,
    });
  } catch (error) {
    console.error('Get stats summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get recommended next room (lowest roadmapOrder, Not Started)
 * @route   GET /api/rooms/recommend
 */
export const getRecommendedRoom = (req, res) => {
  try {
    const room = db.prepare(`
      SELECT * FROM rooms WHERE status = 'Not Started'
      ORDER BY roadmapOrder ASC LIMIT 1
    `).get();

    if (!room) {
      return res.json({ message: 'All rooms completed or in progress!', room: null });
    }

    res.json({ room });
  } catch (error) {
    console.error('Get recommended room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
