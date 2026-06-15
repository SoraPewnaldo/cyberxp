import { useState, useEffect } from 'react';
import API from '../api/axios';
import AchievementCard from '../components/AchievementCard';
import ProgressBar from '../components/ProgressBar';

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({ total: 0, unlocked: 0, locked: 0 });
  const [filter, setFilter] = useState('all'); // all, unlocked, locked
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const { data } = await API.get('/achievements');
      setAchievements(data.achievements);
      setStats(data.stats);
    } catch (error) {
      console.error('Fetch achievements error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'locked') return !a.unlocked;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="font-['VT323'] text-2xl animate-blink text-white">LOADING TROPHIES...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b-2 border-white pb-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white uppercase">🏆 Achievements</h1>
        <p className="text-gray-400 mt-2 font-mono uppercase text-sm">Track your milestones</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="retro-card text-center">
          <p className="text-5xl font-bold text-white font-['VT323']">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-2 font-mono uppercase font-bold">Total</p>
        </div>
        <div className="retro-card text-center border-white">
          <p className="text-5xl font-bold text-white font-['VT323']">{stats.unlocked}</p>
          <p className="text-xs text-white mt-2 font-mono uppercase font-bold">Unlocked</p>
        </div>
        <div className="retro-card text-center border-gray-600">
          <p className="text-5xl font-bold text-gray-500 font-['VT323']">{stats.locked}</p>
          <p className="text-xs text-gray-500 mt-2 font-mono uppercase font-bold">Locked</p>
        </div>
      </div>

      {/* Progress */}
      <div className="retro-card">
        <div className="flex items-center justify-between mb-4 border-b-2 border-dotted border-gray-600 pb-2">
          <span className="text-2xl text-white">Progress</span>
          <span className="text-4xl font-bold text-white font-['VT323']">
            {stats.total > 0 ? Math.round((stats.unlocked / stats.total) * 100) : 0}%
          </span>
        </div>
        <ProgressBar
          percentage={stats.total > 0 ? (stats.unlocked / stats.total) * 100 : 0}
          showLabel={false}
          height="24px"
        />
      </div>

      {/* Filter */}
      <div className="flex gap-4 border-t-2 border-dotted border-gray-600 pt-4">
        {[
          { key: 'all', label: 'ALL' },
          { key: 'unlocked', label: '✅ UNLOCKED' },
          { key: 'locked', label: '🔒 LOCKED' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 font-bold uppercase transition-all border-2 text-xs font-mono ${
              filter === f.key
                ? 'bg-white text-black border-white'
                : 'bg-black text-gray-400 border-gray-600 hover:text-white hover:border-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredAchievements.map((achievement, index) => (
          <AchievementCard key={achievement.id || achievement._id} achievement={achievement} delay={index * 50} />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="retro-card text-center py-12">
          <span className="text-6xl mb-4 block grayscale">🎯</span>
          <p className="text-white font-bold text-2xl font-['VT323'] uppercase">
            {filter === 'unlocked' ? 'No trophies unlocked yet' : 'No locked trophies'}
          </p>
          <p className="text-gray-500 mt-2 font-mono uppercase text-sm">Keep playing to unlock more</p>
        </div>
      )}
    </div>
  );
}
