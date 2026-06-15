import pool from '../config/db.js';
import { checkAndUnlockAchievements } from '../utils/achievements.js';

// XP rewards by difficulty
const XP_REWARDS = { Easy: 10, Medium: 25, Hard: 50 };

const mapRoom = (r) => {
  if (!r) return null;
  return {
    id: r.id,
    roomName: r.roomname,
    category: r.category,
    path: r.path,
    difficulty: r.difficulty,
    url: r.url,
    status: r.status,
    xpReward: r.xpreward,
    priorityScore: r.priorityscore,
    roadmapOrder: r.roadmaporder,
    createdAt: r.createdat
  };
};

/**
 * @desc    Get all rooms (with optional search / category / status / path filters)
 * @route   GET /api/rooms
 */
export const getRooms = async (req, res) => {
  try {
    const { search, category, status, path } = req.query;

    let sql    = 'SELECT * FROM rooms WHERE 1=1';
    const params = [];

    if (category) { params.push(category); sql += ` AND category = $${params.length}`; }
    if (status)   { params.push(status);   sql += ` AND status = $${params.length}`; }
    if (path)     { params.push(path);     sql += ` AND path = $${params.length}`; }
    if (search)   { params.push(`%${search}%`); sql += ` AND roomName LIKE $${params.length}`; }

    sql += ' ORDER BY roadmapOrder ASC, id ASC';

    const result = await pool.query(sql, params);
    res.json(result.rows.map(mapRoom));
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get single room by ID
 * @route   GET /api/rooms/:id
 */
export const getRoom = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rooms WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Room not found' });
    res.json(mapRoom(result.rows[0]));
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Add a new room
 * @route   POST /api/rooms
 */
export const addRoom = async (req, res) => {
  try {
    const { roomName, category, path, difficulty, url, status, roadmapOrder } = req.body;

    if (!roomName || !category || !difficulty) {
      return res.status(400).json({ message: 'Please provide roomName, category, and difficulty' });
    }

    const xpReward = XP_REWARDS[difficulty] || 10;

    const result = await pool.query(`
      INSERT INTO rooms (roomName, category, path, difficulty, url, status, xpReward, roadmapOrder)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      roomName,
      category,
      path      || 'General',
      difficulty,
      url       || '',
      status    || 'Not Started',
      xpReward,
      roadmapOrder || 999
    ]);

    res.status(201).json(mapRoom(result.rows[0]));
  } catch (error) {
    console.error('Add room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update a room
 * @route   PUT /api/rooms/:id
 */
export const updateRoom = async (req, res) => {
  try {
    const roomRes = await pool.query('SELECT * FROM rooms WHERE id = $1', [req.params.id]);
    if (roomRes.rows.length === 0) return res.status(404).json({ message: 'Room not found' });
    const room = mapRoom(roomRes.rows[0]);

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

    const result = await pool.query(`
      UPDATE rooms SET
        roomName = $1, category = $2, path = $3, difficulty = $4,
        url = $5, status = $6, xpReward = $7, roadmapOrder = $8
      WHERE id = $9
      RETURNING *
    `, [
      updated.roomName, updated.category, updated.path, updated.difficulty,
      updated.url, updated.status, updated.xpReward, updated.roadmapOrder,
      Number(req.params.id)
    ]);

    res.json(mapRoom(result.rows[0]));
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete a room
 * @route   DELETE /api/rooms/:id
 */
export const deleteRoom = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM rooms WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Room not found' });
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
export const completeRoom = async (req, res) => {
  try {
    const roomRes = await pool.query('SELECT * FROM rooms WHERE id = $1', [req.params.id]);
    if (roomRes.rows.length === 0) return res.status(404).json({ message: 'Room not found' });
    const room = mapRoom(roomRes.rows[0]);

    if (room.status === 'Completed') {
      return res.status(400).json({ message: 'Room is already completed' });
    }

    // Mark room completed
    await pool.query("UPDATE rooms SET status = 'Completed' WHERE id = $1", [req.params.id]);

    // Get / update settings
    let settingsRes = await pool.query('SELECT * FROM settings WHERE id = 1');
    let settings = settingsRes.rows[0];
    const xpReward = room.xpReward;
    let newXP = (settings.xp || 0) + xpReward;

    // Streak logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let newStreak = settings.streak || 0;

    if (settings.lastcompletiondate) {
      const lastDate = new Date(settings.lastcompletiondate);
      lastDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 0)      { /* same day — no change */ }
      else if (diffDays === 1) { newStreak += 1; }   // consecutive
      else                     { newStreak = 1; }    // broken
    } else {
      newStreak = 1; // first completion
    }

    await pool.query(`
      UPDATE settings
      SET xp = $1, streak = $2, lastCompletionDate = $3, updatedAt = CURRENT_TIMESTAMP
      WHERE id = 1
    `, [newXP, newStreak, new Date().toISOString()]);

    // Log activity
    await pool.query(`
      INSERT INTO activity_logs (action, xp) VALUES ($1, $2)
    `, [`Completed ${room.roomName}`, xpReward]);

    // Reload settings for achievement check
    settingsRes = await pool.query('SELECT * FROM settings WHERE id = 1');
    settings = settingsRes.rows[0];
    const mappedSettings = {
      xp: settings.xp,
      streak: settings.streak,
      lastCompletionDate: settings.lastcompletiondate
    };
    const newlyUnlocked = await checkAndUnlockAchievements(mappedSettings);

    const updatedRoomRes = await pool.query('SELECT * FROM rooms WHERE id = $1', [req.params.id]);

    res.json({
      room: mapRoom(updatedRoomRes.rows[0]),
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
export const getStatsSummary = async (req, res) => {
  try {
    const totalRes       = await pool.query("SELECT COUNT(*) AS n FROM rooms");
    const completedRes   = await pool.query("SELECT COUNT(*) AS n FROM rooms WHERE status = 'Completed'");
    const inProgressRes  = await pool.query("SELECT COUNT(*) AS n FROM rooms WHERE status = 'In Progress'");

    const total = parseInt(totalRes.rows[0].n, 10);
    const completed = parseInt(completedRes.rows[0].n, 10);
    const inProgress = parseInt(inProgressRes.rows[0].n, 10);

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
export const getRecommendedRoom = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM rooms WHERE status = 'Not Started'
      ORDER BY roadmapOrder ASC LIMIT 1
    `);

    if (result.rows.length === 0) {
      return res.json({ message: 'All rooms completed or in progress!', room: null });
    }

    res.json({ room: mapRoom(result.rows[0]) });
  } catch (error) {
    console.error('Get recommended room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
