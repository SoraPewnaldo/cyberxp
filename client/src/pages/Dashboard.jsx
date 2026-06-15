import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import API from '../api/axios';
import { getLevelProgress, getLevelTitle } from '../utils/levels';
import StatsCard from '../components/StatsCard';
import ProgressBar from '../components/ProgressBar';
import CategoryProgress from '../components/CategoryProgress';
import RecommendedRoom from '../components/RecommendedRoom';
import ReadinessGauge from '../components/ReadinessGauge';
import AchievementCard from '../components/AchievementCard';

export default function Dashboard() {
  const { settings, fetchSettings } = useSettings();
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [recommended, setRecommended] = useState(null);
  const [readiness, setReadiness] = useState({ score: 0, categories: {} });
  const [achievements, setAchievements] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, catRes, recRes, readyRes, achRes, actRes] = await Promise.all([
        API.get('/rooms/stats/summary'),
        API.get('/analytics/categories'),
        API.get('/rooms/recommend'),
        API.get('/analytics/readiness'),
        API.get('/achievements'),
        API.get('/analytics/activity?limit=5'),
      ]);

      setStats(statsRes.data);
      setCategories(catRes.data);
      setRecommended(recRes.data.room);
      setReadiness(readyRes.data);
      setAchievements(achRes.data.achievements?.filter((a) => a.unlocked).slice(0, 4) || []);
      setActivities(actRes.data);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRoom = async (roomId) => {
    try {
      await API.put(`/rooms/${roomId}`, { status: 'In Progress' });
      fetchDashboardData();
    } catch (error) {
      console.error('Start room error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <p className="font-['VT323'] text-2xl animate-blink text-white">LOADING DATA...</p>
        </div>
      </div>
    );
  }

  const levelInfo = settings ? getLevelProgress(settings.xp) : { level: 1, progress: 0 };
  const levelTitle = getLevelTitle(levelInfo.level);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in border-b-2 border-white pb-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white uppercase">
          Welcome back, {settings?.displayName}
        </h1>
        <p className="text-gray-400 mt-2 font-mono uppercase text-sm">Status: Online | User ID: {settings?.displayName.toLowerCase() || 'guest'}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon="⚡"
          label="Level"
          value={`Lv.${levelInfo.level}`}
          subtext={levelTitle}
          delay={0}
        />
        <StatsCard
          icon="✨"
          label="Total XP"
          value={settings?.xp || 0}
          subtext={levelInfo.nextLevelXP ? `${levelInfo.nextLevelXP - (settings?.xp || 0)} XP needed` : 'Max level'}
          delay={100}
        />
        <StatsCard
          icon="🔥"
          label="Streak"
          value={`${settings?.streak || 0} days`}
          subtext="Active combo"
          delay={200}
        />
        <StatsCard
          icon="✅"
          label="Completed"
          value={stats?.completedRooms || 0}
          subtext={`of ${stats?.totalRooms || 0} rooms`}
          delay={300}
        />
      </div>

      {/* Level Progress */}
      <div className="retro-card animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between mb-4 border-b-2 border-white/10 pb-2">
          <div>
            <h3 className="text-2xl text-white">Level Progress</h3>
            <p className="text-xs text-gray-400 font-mono mt-1 uppercase">
              {levelInfo.nextLevelXP
                ? `${levelInfo.xpInLevel} / ${levelInfo.xpNeeded} XP to Level ${levelInfo.level + 1}`
                : 'Maximum level achieved'}
            </p>
          </div>
          <span className="text-4xl font-bold text-white font-['VT323']">Lv.{levelInfo.level}</span>
        </div>
        <ProgressBar
          percentage={levelInfo.progress}
          showLabel={false}
          height="16px"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — Readiness + Categories */}
        <div className="lg:col-span-1 space-y-6">
          <ReadinessGauge score={readiness.score} categories={readiness.categories} />
          <RecommendedRoom room={recommended} onStart={handleStartRoom} />
        </div>

        {/* Middle column — Category Progress */}
        <div className="lg:col-span-1">
          <CategoryProgress categories={categories} />
        </div>

        {/* Right column — Achievements + Activity */}
        <div className="lg:col-span-1 space-y-6">
          {/* Recent Achievements */}
          <div className="retro-card">
            <h3 className="text-2xl text-white mb-4 border-b-2 border-dotted border-gray-600 pb-2">🏆 Recent Trophies</h3>
            {achievements.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {achievements.map((a, i) => (
                  <AchievementCard key={a.id || a._id} achievement={a} delay={i * 100} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 font-mono text-xs uppercase text-center py-4 border-2 border-dashed border-gray-700">No trophies yet</p>
            )}
          </div>

          {/* Activity Feed */}
          <div className="retro-card">
            <h3 className="text-2xl text-white mb-4 border-b-2 border-dotted border-gray-600 pb-2">📋 System Log</h3>
            {activities.length > 0 ? (
              <div className="space-y-4 font-mono text-sm">
                {activities.map((activity) => (
                  <div key={activity.id || activity._id} className="flex flex-col py-2 border-b-2 border-dotted border-gray-800 last:border-0">
                    <p className="text-gray-300">
                      <span className="text-white font-bold mr-2">&gt;</span>{activity.action}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-600 uppercase">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                      <span className="retro-badge-inverted text-xs px-1">+{activity.xp} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 font-mono text-xs uppercase text-center py-4 border-2 border-dashed border-gray-700">Log empty</p>
            )}
          </div>
        </div>
      </div>

      {/* Overall Completion */}
      <div className="retro-card animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl text-white">Overall Completion</h3>
          <span className="text-4xl font-bold text-white font-['VT323']">{stats?.completionPercentage || 0}%</span>
        </div>
        <ProgressBar
          percentage={stats?.completionPercentage || 0}
          showLabel={false}
          height="24px"
        />
        <div className="flex items-center justify-between mt-4 text-xs font-mono text-gray-400 uppercase font-bold">
          <span>{stats?.completedRooms || 0} Completed</span>
          <span className="text-gray-600">|</span>
          <span>{stats?.inProgressRooms || 0} In Progress</span>
          <span className="text-gray-600">|</span>
          <span>{stats?.notStarted || 0} Pending</span>
        </div>
      </div>
    </div>
  );
}
