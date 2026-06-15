import db from '../config/db.js';

// Category weights for internship readiness score
const CATEGORY_WEIGHTS = {
  Linux:             0.20,
  Networking:        0.20,
  Web:               0.20,
  PrivEsc:           0.15,
  'Active Directory':0.15,
  Windows:           0.10,
};

/**
 * @desc    Get internship readiness score
 * @route   GET /api/analytics/readiness
 */
export const getReadinessScore = (req, res) => {
  try {
    // Total rooms per category
    const totalRows = db.prepare(`
      SELECT category, COUNT(*) AS count FROM rooms GROUP BY category
    `).all();

    // Completed rooms per category
    const completedRows = db.prepare(`
      SELECT category, COUNT(*) AS count FROM rooms WHERE status = 'Completed' GROUP BY category
    `).all();

    const totalMap = {};
    totalRows.forEach((r) => (totalMap[r.category] = r.count));

    const completedMap = {};
    completedRows.forEach((r) => (completedMap[r.category] = r.count));

    const categories = {};
    let overallScore = 0;

    for (const [category, weight] of Object.entries(CATEGORY_WEIGHTS)) {
      const total     = totalMap[category]     || 0;
      const completed = completedMap[category] || 0;
      const score     = total > 0 ? Math.round((completed / total) * 100) : 0;
      categories[category] = score;
      overallScore += score * weight;
    }

    res.json({
      score: Math.round(overallScore),
      categories,
    });
  } catch (error) {
    console.error('Get readiness score error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get category completion breakdown
 * @route   GET /api/analytics/categories
 */
export const getCategoryStats = (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT
        category,
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'Completed'   THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS inProgress,
        ROUND(
          CAST(SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS REAL)
          / COUNT(*) * 100
        ) AS percentage
      FROM rooms
      GROUP BY category
      ORDER BY percentage DESC
    `).all();

    res.json(stats);
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get recent activity feed
 * @route   GET /api/analytics/activity
 */
export const getActivityFeed = (req, res) => {
  try {
    const limit      = Math.min(parseInt(req.query.limit) || 20, 100);
    const activities = db.prepare(`
      SELECT * FROM activity_logs ORDER BY createdAt DESC LIMIT ?
    `).all(limit);

    res.json(activities);
  } catch (error) {
    console.error('Get activity feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
