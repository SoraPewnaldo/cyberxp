import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import API from '../api/axios';
import { getLevelProgress, getLevelTitle } from '../utils/levels';
import ProgressBar from '../components/ProgressBar';

export default function Settings() {
  const { settings, fetchSettings } = useSettings();
  const [editing, setEditing] = useState(false);
  
  const [displayName, setDisplayName] = useState(settings?.displayName || '');
  const [avatar, setAvatar] = useState(settings?.avatar || '');
  
  // Advanced edits
  const [xp, setXp] = useState(settings?.xp || 0);
  const [streak, setStreak] = useState(settings?.streak || 0);

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const levelInfo = settings ? getLevelProgress(settings.xp) : { level: 1, progress: 0 };
  const levelTitle = getLevelTitle(levelInfo.level);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const updateData = {
        displayName,
        avatar,
        xp: parseInt(xp),
        streak: parseInt(streak)
      };

      await API.put('/settings', updateData);
      await fetchSettings();
      setEditing(false);
      setMessage({ type: 'success', text: 'SETTINGS SAVED SUCCESSFULLY.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'UPDATE FAILED.' });
    } finally {
      setLoading(false);
    }
  };

  const memberSince = settings?.createdAt
    ? new Date(settings.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Unknown';

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b-2 border-white pb-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white uppercase">⚙️ Settings</h1>
        <p className="text-gray-400 mt-2 font-mono uppercase text-sm">Configure system parameters</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 border-2 shadow-lg animate-fade-in font-['VT323'] text-xl uppercase ${
            message.type === 'error'
              ? 'bg-black border-red-600 text-red-600'
              : 'bg-black border-white text-white'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Card */}
      <div className="retro-card">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 retro-card flex items-center justify-center text-white text-4xl font-bold shrink-0 p-0 rounded-full">
            {settings?.avatar ? settings.avatar : settings?.displayName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white font-['VT323'] uppercase">{settings?.displayName}</h2>
            <p className="text-sm text-gray-500 mt-1 font-mono uppercase font-bold">System init: {memberSince}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-black border-2 border-gray-600 p-4 text-center">
            <p className="text-4xl font-bold text-white font-['VT323']">Lv.{levelInfo.level}</p>
            <p className="text-xs text-gray-500 mt-2 font-mono uppercase font-bold">{levelTitle}</p>
          </div>
          <div className="bg-black border-2 border-gray-600 p-4 text-center">
            <p className="text-4xl font-bold text-white font-['VT323']">{settings?.xp || 0}</p>
            <p className="text-xs text-gray-500 mt-2 font-mono uppercase font-bold">Total XP</p>
          </div>
          <div className="bg-black border-2 border-gray-600 p-4 text-center">
            <p className="text-4xl font-bold text-white font-['VT323']">{settings?.streak || 0}</p>
            <p className="text-xs text-gray-500 mt-2 font-mono uppercase font-bold">Day Streak</p>
          </div>
        </div>

        {/* Level Progress */}
        <ProgressBar
          label={`Level ${levelInfo.level} → ${levelInfo.nextLevelXP ? `Level ${levelInfo.level + 1}` : 'Max'}`}
          percentage={levelInfo.progress}
          height="16px"
        />
      </div>

      {/* Edit Profile */}
      <div className="retro-card">
        <div className="flex items-center justify-between mb-6 border-b-2 border-dotted border-gray-600 pb-2">
          <h3 className="text-2xl text-white">Global Settings</h3>
          {!editing && (
            <button onClick={() => setEditing(true)} className="retro-btn-outline text-xs py-1 px-3">
              EDIT
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label htmlFor="settings-name" className="block text-sm text-gray-400 font-bold uppercase mb-1">Display Name</label>
              <input
                id="settings-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="retro-input w-full"
                required
              />
            </div>

            <div>
              <label htmlFor="settings-avatar" className="block text-sm text-gray-400 font-bold uppercase mb-1">Avatar (Emoji or short text)</label>
              <input
                id="settings-avatar"
                type="text"
                maxLength="2"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="retro-input w-full"
                placeholder="e.g. 👨‍💻"
              />
            </div>

            <div className="pt-6 border-t-2 border-dotted border-gray-600">
              <h4 className="text-xl text-white mb-4">Advanced (Manual Overrides)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="settings-xp" className="block text-sm text-gray-400 font-bold uppercase mb-1">Total XP</label>
                  <input
                    id="settings-xp"
                    type="number"
                    value={xp}
                    onChange={(e) => setXp(e.target.value)}
                    className="retro-input w-full"
                    min="0"
                  />
                </div>
                <div>
                  <label htmlFor="settings-streak" className="block text-sm text-gray-400 font-bold uppercase mb-1">Day Streak</label>
                  <input
                    id="settings-streak"
                    type="number"
                    value={streak}
                    onChange={(e) => setStreak(e.target.value)}
                    className="retro-input w-full"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button type="submit" disabled={loading} className="retro-btn flex-1 disabled:opacity-50">
                {loading ? 'SAVING...' : 'SAVE SETTINGS'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setDisplayName(settings?.displayName || '');
                  setAvatar(settings?.avatar || '');
                  setXp(settings?.xp || 0);
                  setStreak(settings?.streak || 0);
                }}
                className="retro-btn-outline w-1/3"
              >
                CANCEL
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 font-mono text-sm uppercase font-bold">
            <div className="flex items-center justify-between py-3 border-b-2 border-dotted border-gray-800">
              <span className="text-gray-500">Display Name</span>
              <span className="text-white">{settings?.displayName}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b-2 border-dotted border-gray-800">
              <span className="text-gray-500">Avatar</span>
              <span className="text-white">{settings?.avatar || '(Auto)'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="retro-card border-red-600">
        <h3 className="text-2xl text-red-600 mb-4 border-b-2 border-dotted border-red-600 pb-2">⚠️ DANGER ZONE</h3>
        <p className="text-sm text-gray-400 font-mono uppercase mb-4">
          Resetting your progress will erase all XP, streaks, room completion statuses, and unlocked trophies. This action cannot be undone.
        </p>
        <button
          onClick={() => setResetModalOpen(true)}
          className="retro-btn w-full !bg-red-500/20 !border-red-500 !text-red-500 hover:!bg-red-500 hover:!text-white"
        >
          RESET ALL PROGRESS
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setResetModalOpen(false)} />
          <div className="relative retro-card border-red-600 p-6 w-full max-w-md animate-fade-in text-center">
            <span className="text-6xl mb-4 block">⚠️</span>
            <h2 className="text-3xl text-red-600 mb-4 font-['VT323'] uppercase">ARE YOU SURE?</h2>
            <p className="text-sm text-gray-400 font-mono uppercase mb-6">
              This will permanently delete all your progress, XP, and achievements.
              There is no going back.
            </p>
            <div className="flex gap-4">
              <button
                onClick={async () => {
                  try {
                    await API.post('/settings/reset');
                    await fetchSettings();
                    setMessage({ type: 'success', text: 'PROGRESS RESET SUCCESSFULLY.' });
                    setResetModalOpen(false);
                    setTimeout(() => { window.location.href = '/'; }, 1500);
                  } catch (err) {
                    setMessage({ type: 'error', text: 'ERROR RESETTING PROGRESS.' });
                    setResetModalOpen(false);
                  }
                }}
                className="retro-btn flex-1 !bg-red-500/20 !border-red-500 !text-red-500 hover:!bg-red-500 hover:!text-white"
              >
                YES, RESET IT
              </button>
              <button
                onClick={() => setResetModalOpen(false)}
                className="retro-btn-outline flex-1"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
