import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// ─── GET /api/export ──────────────────────────────────────────
// Returns a full JSON snapshot of all data
router.get('/export', (req, res) => {
  try {
    const settings     = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    const rooms        = db.prepare('SELECT * FROM rooms ORDER BY roadmapOrder ASC').all();
    const achievements = db.prepare('SELECT * FROM achievements ORDER BY id ASC').all();
    const activityLogs = db.prepare('SELECT * FROM activity_logs ORDER BY createdAt DESC').all();

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
router.post('/import', (req, res) => {
  try {
    const { settings, rooms, achievements, activityLogs } = req.body;

    if (!settings || !rooms || !achievements) {
      return res.status(400).json({ message: 'Invalid import data — missing required fields' });
    }

    // Wrap everything in a transaction so it's all-or-nothing
    const importAll = db.transaction(() => {
      // Settings
      db.prepare(`
        UPDATE settings SET
          displayName = ?, avatar = ?, xp = ?, streak = ?,
          lastCompletionDate = ?, appVersion = ?, seeded = ?,
          updatedAt = datetime('now')
        WHERE id = 1
      `).run(
        settings.displayName, settings.avatar, settings.xp, settings.streak,
        settings.lastCompletionDate, settings.appVersion, settings.seeded ?? 1
      );

      // Rooms — clear and re-insert
      db.prepare('DELETE FROM rooms').run();
      const insertRoom = db.prepare(`
        INSERT INTO rooms
          (id, roomName, category, path, difficulty, url, status, xpReward, priorityScore, roadmapOrder, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const r of rooms) {
        insertRoom.run(
          r.id, r.roomName, r.category, r.path, r.difficulty,
          r.url, r.status, r.xpReward, r.priorityScore ?? 0, r.roadmapOrder, r.createdAt
        );
      }

      // Achievements — clear and re-insert
      db.prepare('DELETE FROM achievements').run();
      const insertAch = db.prepare(`
        INSERT INTO achievements (id, title, description, icon, unlocked, unlockedAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const a of achievements) {
        insertAch.run(a.id, a.title, a.description, a.icon, a.unlocked, a.unlockedAt);
      }

      // Activity logs — clear and re-insert
      if (activityLogs?.length) {
        db.prepare('DELETE FROM activity_logs').run();
        const insertLog = db.prepare(`
          INSERT INTO activity_logs (id, action, xp, createdAt) VALUES (?, ?, ?, ?)
        `);
        for (const l of activityLogs) {
          insertLog.run(l.id, l.action, l.xp, l.createdAt);
        }
      }
    });

    importAll();

    res.json({
      message: 'Import successful',
      imported: {
        rooms: rooms.length,
        achievements: achievements.length,
        activityLogs: activityLogs?.length ?? 0,
      },
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: 'Import failed: ' + error.message });
  }
});

// ─── POST /api/reset ──────────────────────────────────────────
// Resets all progress (XP, streak, room statuses, activity logs)
// but keeps the roadmap rooms and achievements definitions intact
router.post('/reset', (req, res) => {
  try {
    const resetAll = db.transaction(() => {
      // Reset all room statuses to Not Started
      db.prepare("UPDATE rooms SET status = 'Not Started'").run();

      // Reset settings XP, streak, lastCompletionDate
      db.prepare(`
        UPDATE settings
        SET xp = 0, streak = 0, lastCompletionDate = NULL, updatedAt = datetime('now')
        WHERE id = 1
      `).run();

      // Reset all achievements to locked
      db.prepare("UPDATE achievements SET unlocked = 0, unlockedAt = NULL").run();

      // Clear activity logs
      db.prepare('DELETE FROM activity_logs').run();
    });

    resetAll();

    res.json({ message: 'Progress reset successfully. Rooms and achievements kept.' });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ message: 'Reset failed' });
  }
});

export default router;
