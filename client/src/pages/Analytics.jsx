import { useState, useEffect } from 'react';
import API from '../api/axios';
import ReadinessGauge from '../components/ReadinessGauge';
import CategoryProgress from '../components/CategoryProgress';
import ProgressBar from '../components/ProgressBar';

export default function Analytics() {
  const [readiness, setReadiness] = useState({ score: 0, categories: {} });
  const [categories, setCategories] = useState([]);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [readyRes, catRes, actRes, statsRes] = await Promise.all([
        API.get('/analytics/readiness'),
        API.get('/analytics/categories'),
        API.get('/analytics/activity?limit=50'),
        API.get('/rooms/stats/summary'),
      ]);

      setReadiness(readyRes.data);
      setCategories(catRes.data);
      setActivities(actRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group activities by date
  const groupedActivities = activities.reduce((acc, activity) => {
    const dateKey = new Date(activity.date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(activity);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="font-['VT323'] text-2xl animate-blink text-white">CALCULATING DATA...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b-2 border-white pb-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white uppercase">📊 Analytics</h1>
        <p className="text-gray-400 mt-2 font-mono uppercase text-sm">Deep dive into your progress</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="retro-card text-center">
          <p className="text-5xl font-bold text-white font-['VT323']">{stats?.totalRooms || 0}</p>
          <p className="text-xs text-white mt-2 font-mono uppercase font-bold">Total Rooms</p>
        </div>
        <div className="retro-card text-center">
          <p className="text-5xl font-bold text-white font-['VT323']">{stats?.completedRooms || 0}</p>
          <p className="text-xs text-gray-400 mt-2 font-mono uppercase font-bold">Completed</p>
        </div>
        <div className="retro-card text-center">
          <p className="text-5xl font-bold text-white font-['VT323']">{stats?.inProgressRooms || 0}</p>
          <p className="text-xs text-gray-400 mt-2 font-mono uppercase font-bold">In Progress</p>
        </div>
        <div className="retro-card text-center">
          <p className="text-5xl font-bold text-white font-['VT323']">{stats?.completionPercentage || 0}%</p>
          <p className="text-xs text-gray-400 mt-2 font-mono uppercase font-bold">Completion</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Readiness Gauge */}
        <ReadinessGauge score={readiness.score} categories={readiness.categories} />

        {/* Category Progress */}
        <CategoryProgress categories={categories} />
      </div>

      {/* Difficulty Breakdown */}
      <div className="retro-card">
        <h3 className="text-2xl text-white mb-4 border-b-2 border-dotted border-gray-600 pb-2">🎯 Status Breakdown</h3>
        <div className="space-y-4 pt-2">
          <ProgressBar
            label="Completed"
            percentage={stats?.totalRooms > 0 ? Math.round((stats.completedRooms / stats.totalRooms) * 100) : 0}
            delay={0}
            height="16px"
          />
          <ProgressBar
            label="In Progress"
            percentage={stats?.totalRooms > 0 ? Math.round((stats.inProgressRooms / stats.totalRooms) * 100) : 0}
            delay={100}
            height="16px"
          />
          <ProgressBar
            label="Not Started"
            percentage={stats?.totalRooms > 0 ? Math.round((stats.notStarted / stats.totalRooms) * 100) : 0}
            delay={200}
            height="16px"
          />
        </div>
      </div>

      {/* Activity Log */}
      <div className="retro-card">
        <h3 className="text-2xl text-white mb-4 border-b-2 border-dotted border-gray-600 pb-2">📋 Activity Log</h3>
        {Object.keys(groupedActivities).length > 0 ? (
          <div className="space-y-6 pt-2">
            {Object.entries(groupedActivities).map(([date, dayActivities]) => (
              <div key={date}>
                <h4 className="text-sm font-bold text-white mb-3 uppercase font-mono border-b-2 border-white inline-block">{date}</h4>
                <div className="space-y-3 ml-4 border-l-2 border-dotted border-gray-600 pl-4">
                  {dayActivities.map((activity) => (
                    <div
                      key={activity.id || activity._id}
                      className="flex items-center justify-between py-1"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-white font-bold">&gt;</span>
                        <p className="text-sm text-gray-300 font-mono uppercase truncate">{activity.action}</p>
                      </div>
                      <span className="retro-badge-inverted text-xs px-2 whitespace-nowrap">
                        +{activity.xp} XP
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 font-mono uppercase text-sm text-center py-8">No activity recorded yet.</p>
        )}
      </div>
    </div>
  );
}
