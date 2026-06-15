export default function AchievementCard({ achievement, delay = 0 }) {
  const isUnlocked = achievement.unlocked;

  return (
    <div
      className={`retro-card p-4 text-center transition-all duration-300 animate-fade-in opacity-0 ${
        isUnlocked
          ? 'border-white'
          : 'opacity-50 grayscale border-gray-600'
      }`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <span className="text-3xl block mb-2">{achievement.icon}</span>
      <h4 className={`text-xl font-bold ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
        {achievement.title}
      </h4>
      <p className="text-sm text-gray-400 mt-2 font-mono">{achievement.description}</p>
      {isUnlocked && achievement.unlockedAt && (
        <p className="text-xs text-white mt-4 font-bold border-t-2 border-dotted border-white pt-2">
          UNLOCKED: {new Date(achievement.unlockedAt).toLocaleDateString()}
        </p>
      )}
      {!isUnlocked && (
        <p className="text-xs text-gray-500 mt-4 font-bold border-t-2 border-dotted border-gray-600 pt-2">LOCKED</p>
      )}
    </div>
  );
}
