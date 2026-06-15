export default function StatsCard({ icon, label, value, subtext, delay = 0 }) {
  return (
    <div
      className="retro-card animate-fade-in opacity-0"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider font-mono">{label}</p>
          <p className="text-4xl font-bold mt-2 text-white font-['VT323']">{value}</p>
          {subtext && <p className="text-gray-500 text-xs mt-2 uppercase font-bold">{subtext}</p>}
        </div>
        <span className="text-3xl grayscale">{icon}</span>
      </div>
    </div>
  );
}
