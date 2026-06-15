export default function RecommendedRoom({ room, onStart }) {
  if (!room) {
    return (
      <div className="retro-card">
        <h3 className="text-2xl text-white mb-4 border-b-2 border-dotted border-gray-600 pb-2">🎯 Recommended Next</h3>
        <div className="text-center py-6">
          <span className="text-4xl mb-2 block grayscale">🎉</span>
          <p className="text-white font-bold font-mono uppercase">All caught up!</p>
          <p className="text-gray-500 text-xs mt-1 font-mono uppercase">No pending rooms</p>
        </div>
      </div>
    );
  }

  return (
    <div className="retro-card animate-fade-in">
      <h3 className="text-2xl text-white mb-4 border-b-2 border-dotted border-gray-600 pb-2">🎯 Recommended Next</h3>

      <div className="space-y-4">
        <div>
          <p className="text-xl font-bold text-white font-['VT323'] tracking-wider">{room.roomName}</p>
          <p className="text-sm text-gray-400 mt-1 uppercase font-bold font-mono">{room.path || 'General'}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="retro-badge">{room.category}</span>
          <span className="retro-badge">
            {room.difficulty}
          </span>
          <span className="retro-badge-inverted font-bold">+{room.xpReward} XP</span>
        </div>

        {room.url && (
          <a
            href={room.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-300 hover:text-white hover:underline truncate block mt-2"
          >
            {room.url}
          </a>
        )}

        <button
          onClick={() => {
            onStart(room.id || room._id);
            if (room.url) {
              window.open(room.url, '_blank', 'noopener,noreferrer');
            }
          }}
          className="retro-btn w-full mt-2"
        >
          START ROOM
        </button>
      </div>
    </div>
  );
}
