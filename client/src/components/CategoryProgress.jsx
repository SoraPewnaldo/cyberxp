import ProgressBar from './ProgressBar';

const categoryIcons = {
  General: '📂',
  Linux: '🐧',
  Windows: '🪟',
  Networking: '🌍',
  Cryptography: '🔐',
  Web: '🌐',
  Forensics: '🔍',
  PrivEsc: '🪜',
  'Active Directory': '🏢',
  CTF: '🚩',
};

export default function CategoryProgress({ categories }) {
  if (!categories || categories.length === 0) {
    return (
      <div className="retro-card p-5 text-center">
        <p className="text-gray-500 font-mono text-sm uppercase">No category data available</p>
      </div>
    );
  }

  return (
    <div className="retro-card p-5">
      <h3 className="text-2xl text-white mb-6">📁 Category Progress</h3>
      <div className="space-y-6">
        {categories.map((cat, index) => (
          <div key={cat.category || cat.id} className="animate-fade-in opacity-0" style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">{categoryIcons[cat.category || cat.id] || '📂'}</span>
              <span className="text-sm font-bold text-white uppercase">{cat.category || cat.id}</span>
              <span className="font-['VT323'] text-xl text-gray-400 ml-auto">
                {cat.completed}/{cat.total}
              </span>
            </div>
            <ProgressBar
              percentage={cat.percentage}
              showLabel={false}
              delay={index * 100}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
