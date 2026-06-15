import pool from '../config/db.js';

const mapSettings = (s) => {
  if (!s) return null;
  return {
    id: s.id,
    displayName: s.displayname,
    avatar: s.avatar,
    xp: s.xp,
    streak: s.streak,
    lastCompletionDate: s.lastcompletiondate,
    appVersion: s.appversion,
    seeded: s.seeded,
    createdAt: s.createdat,
    updatedAt: s.updatedat
  };
};

/**
 * @desc    Get application settings
 * @route   GET /api/settings
 */
export const getSettings = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings WHERE id = 1');
    res.json(mapSettings(result.rows[0]));
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update application settings
 * @route   PUT /api/settings
 */
export const updateSettings = async (req, res) => {
  try {
    const currentRes = await pool.query('SELECT * FROM settings WHERE id = 1');
    if (currentRes.rows.length === 0) return res.status(404).json({ message: 'Settings not found' });
    const current = mapSettings(currentRes.rows[0]);

    const { displayName, avatar, xp, streak, lastCompletionDate, appVersion } = req.body;

    const updated = {
      displayName:        displayName        !== undefined ? displayName        : current.displayName,
      avatar:             avatar             !== undefined ? avatar             : current.avatar,
      xp:                 xp                 !== undefined ? xp                 : current.xp,
      streak:             streak             !== undefined ? streak             : current.streak,
      lastCompletionDate: lastCompletionDate !== undefined ? lastCompletionDate : current.lastCompletionDate,
      appVersion:         appVersion         !== undefined ? appVersion         : current.appVersion,
    };

    await pool.query(`
      UPDATE settings SET
        displayName = $1, avatar = $2, xp = $3, streak = $4,
        lastCompletionDate = $5, appVersion = $6, updatedAt = CURRENT_TIMESTAMP
      WHERE id = 1
    `, [
      updated.displayName, updated.avatar, updated.xp, updated.streak,
      updated.lastCompletionDate, updated.appVersion
    ]);

    const result = await pool.query('SELECT * FROM settings WHERE id = 1');
    res.json(mapSettings(result.rows[0]));
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Reset user progress (XP, streak, rooms, achievements, activity)
 * @route   POST /api/settings/reset
 */
export const resetProgress = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Reset Settings
    await client.query(`
      UPDATE settings SET
        xp = 0, streak = 0, lastCompletionDate = null, updatedAt = CURRENT_TIMESTAMP
      WHERE id = 1
    `);

    // 2. Reset Rooms
    await client.query(`
      UPDATE rooms SET
        status = 'Not Started'
    `);

    // 3. Reset Achievements
    await client.query(`
      UPDATE achievements SET
        unlocked = 0, unlockedAt = null
    `);

    // 4. Clear Activity Log
    await client.query(`DELETE FROM activity_logs`);

    await client.query('COMMIT');

    const result = await pool.query('SELECT * FROM settings WHERE id = 1');
    res.json({ message: 'Progress has been reset successfully.', settings: mapSettings(result.rows[0]) });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Reset progress error:', error);
    res.status(500).json({ message: 'Server error during reset' });
  } finally {
    client.release();
  }
};
