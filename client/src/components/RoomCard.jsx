export default function RoomCard({ room, isLocked, onEdit, onDelete, onComplete, onStart }) {
  const xpMap = { Easy: 10, Medium: 25, Hard: 50 };

  return (
    <div className={`retro-card flex flex-col gap-3 transition-opacity duration-300 ${isLocked ? 'opacity-60 grayscale-[10%]' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 overflow-hidden">
        <div className="min-w-0 flex-1 group cursor-default">
          <div className="flex w-full overflow-hidden mask-edges">
            <div className="flex whitespace-nowrap group-hover:animate-[rolling-text_5s_linear_infinite]">
              <h3 className="text-xl font-bold text-white truncate group-hover:w-auto group-hover:text-clip pr-12">
                {room.roomName}
              </h3>
              <h3 className="text-xl font-bold text-white hidden group-hover:block pr-12">
                {room.roomName}
              </h3>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-1 uppercase font-bold">{room.path || 'General'}</p>
        </div>
        <span className={`retro-badge-inverted font-bold text-xs px-2 py-1 uppercase border-2 shrink-0 ${
          isLocked ? 'border-gray-600 text-gray-400' : 
          room.status === 'Completed' ? 'border-[var(--color-cyber-primary)] text-[var(--color-cyber-primary)]' : 
          room.status === 'In Progress' ? 'border-amber-500 text-amber-500' : 'border-white text-white'
        }`}>
          {isLocked ? '🔒 Locked' : room.status}
        </span>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap mt-2">
        <span className="retro-badge">{room.difficulty}</span>
        <span className="retro-badge">{room.category}</span>
        <span className="retro-badge-inverted font-bold">+{room.xpReward || xpMap[room.difficulty]} XP</span>
      </div>

      {/* URL */}
      {room.url && !isLocked && (
        <a
          href={room.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-300 hover:text-white hover:underline truncate block mt-2"
        >
          {room.url}
        </a>
      )}
      {room.url && isLocked && (
        <span className="text-xs text-gray-500 truncate block mt-2 cursor-not-allowed">
          {room.url}
        </span>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 mt-auto pt-4 border-t border-[var(--color-cyber-border)]">
        {room.status === 'Not Started' && (
          isLocked ? (
            <button 
              disabled
              className="retro-btn-outline text-xs py-1.5 px-3 opacity-50 cursor-not-allowed !border-gray-600 !text-gray-500"
            >
              🔒 LOCKED
            </button>
          ) : (
            <button 
              onClick={() => {
                onStart(room.id || room._id);
                if (room.url) {
                  window.open(room.url, '_blank', 'noopener,noreferrer');
                }
              }} 
              className="retro-btn text-xs py-1.5 px-3"
            >
              START
            </button>
          )
        )}
        {room.status === 'In Progress' && (
          <button onClick={() => onComplete(room.id || room._id)} className="retro-btn text-xs py-1.5 px-3">
            COMPLETE
          </button>
        )}
        {!isLocked && room.status !== 'Completed' && (
          <button onClick={() => onEdit(room)} className="retro-btn-outline text-xs py-1.5 px-3">
            EDIT
          </button>
        )}
        <button onClick={() => onDelete(room.id || room._id)} className="retro-btn text-xs py-1.5 px-3 !bg-red-500/20 !border-red-500 !text-red-500 hover:!bg-red-500 hover:!text-white">
          X
        </button>
      </div>
    </div>
  );
}
