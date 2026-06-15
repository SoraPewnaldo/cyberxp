import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

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

const mapAchievement = (a) => {
  if (!a) return null;
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    icon: a.icon,
    unlocked: a.unlocked,
    unlockedAt: a.unlockedat
  };
};

const mapActivityLog = (l) => {
  if (!l) return null;
  return {
    id: l.id,
    action: l.action,
    xp: l.xp,
    createdAt: l.createdat
  };
};

// ─── GET /api/export ──────────────────────────────────────────
// Returns a full JSON snapshot of all data
router.get('/export', async (req, res) => {
  try {
    const settingsRes     = await pool.query('SELECT * FROM settings WHERE id = 1');
    const roomsRes        = await pool.query('SELECT * FROM rooms ORDER BY roadmapOrder ASC');
    const achievementsRes = await pool.query('SELECT * FROM achievements ORDER BY id ASC');
    const activityLogsRes = await pool.query('SELECT * FROM activity_logs ORDER BY createdAt DESC');

    const settings = mapSettings(settingsRes.rows[0]);
    const rooms = roomsRes.rows.map(mapRoom);
    const achievements = achievementsRes.rows.map(mapAchievement);
    const activityLogs = activityLogsRes.rows.map(mapActivityLog);

    res.json({
      exportedAt: new Date().toISOString(),
      appVersion: settings?.appVersion || '1.0.0',
      settings,
      rooms,
      achievements,
      activityLogs,
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Export failed' });
  }
});

// ─── POST /api/import ─────────────────────────────────────────
// Imports a previously exported JSON snapshot
router.post('/import', async (req, res) => {
  const client = await pool.connect();
  try {
    const { settings, rooms, achievements, activityLogs } = req.body;

    if (!settings || !rooms || !achievements) {
      return res.status(400).json({ message: 'Invalid import data — missing required fields' });
    }

    await client.query('BEGIN');

    // Settings
    await client.query(`
      UPDATE settings SET
        displayName = $1, avatar = $2, xp = $3, streak = $4,
        lastCompletionDate = $5, appVersion = $6, seeded = $7,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = 1
    `, [
      settings.displayName, settings.avatar, settings.xp, settings.streak,
      settings.lastCompletionDate, settings.appVersion, settings.seeded ?? 1
    ]);

    // Rooms — clear and re-insert
    await client.query('DELETE FROM rooms');
    for (const r of rooms) {
      await client.query(`
        INSERT INTO rooms
          (id, roomName, category, path, difficulty, url, status, xpReward, priorityScore, roadmapOrder, createdAt)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        r.id, r.roomName, r.category, r.path, r.difficulty,
        r.url, r.status, r.xpReward, r.priorityScore ?? 0, r.roadmapOrder, r.createdAt
      ]);
    }

    // Achievements — clear and re-insert
    await client.query('DELETE FROM achievements');
    for (const a of achievements) {
      await client.query(`
        INSERT INTO achievements (id, title, description, icon, unlocked, unlockedAt)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [a.id, a.title, a.description, a.icon, a.unlocked, a.unlockedAt]);
    }

    // Activity logs — clear and re-insert
    if (activityLogs?.length) {
      await client.query('DELETE FROM activity_logs');
      for (const l of activityLogs) {
        await client.query(`
          INSERT INTO activity_logs (id, action, xp, createdAt) VALUES ($1, $2, $3, $4)
        `, [l.id, l.action, l.xp, l.createdAt]);
      }
    }

    await client.query('COMMIT');

    res.json({
      message: 'Import successful',
      imported: {
        rooms: rooms.length,
        achievements: achievements.length,
        activityLogs: activityLogs?.length ?? 0,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Import error:', error);
    res.status(500).json({ message: 'Import failed: ' + error.message });
  } finally {
    client.release();
  }
});

// ─── POST /api/reset ──────────────────────────────────────────
// Resets all progress (XP, streak, room statuses, activity logs)
// but keeps the roadmap rooms and achievements definitions intact
router.post('/reset', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Reset all room statuses to Not Started
    await client.query("UPDATE rooms SET status = 'Not Started'");

    // Reset settings XP, streak, lastCompletionDate
    await client.query(`
      UPDATE settings
      SET xp = 0, streak = 0, lastCompletionDate = NULL, updatedAt = CURRENT_TIMESTAMP
      WHERE id = 1
    `);

    // Reset all achievements to locked
    await client.query("UPDATE achievements SET unlocked = 0, unlockedAt = NULL");

    // Clear activity logs
    await client.query('DELETE FROM activity_logs');

    await client.query('COMMIT');

    res.json({ message: 'Progress reset successfully. Rooms and achievements kept.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Reset error:', error);
    res.status(500).json({ message: 'Reset failed' });
  } finally {
    client.release();
  }
});

export default router;
