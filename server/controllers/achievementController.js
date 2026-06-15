import pool from '../config/db.js';

/**
 * @desc    Get all achievements
 * @route   GET /api/achievements
 */
export const getAchievements = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM achievements
      ORDER BY unlocked DESC, unlockedAt DESC, id ASC
    `);

    const achievements = result.rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      icon: r.icon,
      unlocked: r.unlocked,
      unlockedAt: r.unlockedat,
    }));

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
