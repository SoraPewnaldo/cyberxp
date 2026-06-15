import ProgressBar from './ProgressBar';

export default function ReadinessGauge({ score, categories }) {
  const getScoreLabel = (s) => {
    if (s >= 75) return 'Expert';
    if (s >= 50) return 'Intermediate';
    if (s >= 25) return 'Beginner';
    return 'Novice';
  };

  return (
    <div className="retro-card">
      <h3 className="text-2xl text-white mb-4 border-b-2 border-dotted border-gray-600 pb-2">🧠 Knowledge Percentage</h3>

      <div className="flex flex-col items-center">
        <div className="mb-4 text-center">
          <span className="text-6xl font-bold text-white font-['VT323']">{score}%</span>
          <p className="text-sm text-gray-400 mt-2 font-mono uppercase font-bold">{getScoreLabel(score)}</p>
        </div>

        {/* Category breakdown */}
        {categories && (
          <div className="w-full mt-4 space-y-4 border-t-2 border-dotted border-gray-600 pt-4">
            {Object.entries(categories).map(([cat, pct]) => (
              <ProgressBar key={cat} label={cat} percentage={pct} height="12px" delay={0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
