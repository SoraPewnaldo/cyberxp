export default function ProgressBar({ label, percentage, color = 'primary', showLabel = true, height = '16px', delay = 0 }) {
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-bold uppercase">{label}</span>
          <span className="font-['VT323'] text-xl">{percentage}%</span>
        </div>
      )}
      <div className="retro-progress-container" style={{ height }}>
        <div
          className="retro-progress-fill"
          style={{ width: `${percentage}%`, animationDelay: `${delay}ms` }}
        />
      </div>
    </div>
  );
}
