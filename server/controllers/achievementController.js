import db from '../config/db.js';

/**
 * @desc    Get all achievements
 * @route   GET /api/achievements
 */
export const getAchievements = (req, res) => {
  try {
    const achievements = db.prepare(`
      SELECT * FROM achievements
      ORDER BY unlocked DESC, unlockedAt DESC, id ASC
    `).all();

    const unlocked = achievements.filter((a) => a.unlocked).length;

    res.json({
      achievements,
      stats: {
        total:    achievements.length,
        unlocked,
        locked:   achievements.length - unlocked,
      },
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
