import db from '../config/db.js';

/**
 * @desc    Get application settings
 * @route   GET /api/settings
 */
export const getSettings = (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Update application settings
 * @route   PUT /api/settings
 */
export const updateSettings = (req, res) => {
  try {
    const current = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    if (!current) return res.status(404).json({ message: 'Settings not found' });

    const { displayName, avatar, xp, streak, lastCompletionDate, appVersion } = req.body;

    const updated = {
      displayName:        displayName        !== undefined ? displayName        : current.displayName,
      avatar:             avatar             !== undefined ? avatar             : current.avatar,
      xp:                 xp                !== undefined ? xp                 : current.xp,
      streak:             streak             !== undefined ? streak             : current.streak,
      lastCompletionDate: lastCompletionDate !== undefined ? lastCompletionDate : current.lastCompletionDate,
      appVersion:         appVersion         !== undefined ? appVersion         : current.appVersion,
    };

    db.prepare(`
      UPDATE settings SET
        displayName = ?, avatar = ?, xp = ?, streak = ?,
        lastCompletionDate = ?, appVersion = ?, updatedAt = datetime('now')
      WHERE id = 1
    `).run(
      updated.displayName, updated.avatar, updated.xp, updated.streak,
      updated.lastCompletionDate, updated.appVersion
    );

    const result = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    res.json(result);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Reset user progress (XP, streak, rooms, achievements, activity)
 * @route   POST /api/settings/reset
 */
export const resetProgress = (req, res) => {
  try {
    db.exec('BEGIN EXCLUSIVE TRANSACTION');

    // 1. Reset Settings
    db.prepare(`
      UPDATE settings SET
        xp = 0, streak = 0, lastCompletionDate = null, updatedAt = datetime('now')
      WHERE id = 1
    `).run();

    // 2. Reset Rooms
    db.prepare(`
      UPDATE rooms SET
        status = 'Not Started'
    `).run();

    // 3. Reset Achievements
    db.prepare(`
      UPDATE achievements SET
        unlocked = 0, unlockedAt = null
    `).run();

    // 4. Clear Activity Log
    db.prepare(`DELETE FROM activity_logs`).run();

    db.exec('COMMIT');

    const result = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    res.json({ message: 'Progress has been reset successfully.', settings: result });
  } catch (error) {
    db.exec('ROLLBACK');
    console.error('Reset progress error:', error);
    res.status(500).json({ message: 'Server error during reset' });
  }
};
