import { useState, useEffect } from 'react';

const CATEGORIES = ['General', 'Linux', 'Windows', 'Networking', 'Cryptography', 'Web', 'Forensics', 'PrivEsc', 'Active Directory', 'CTF'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const STATUSES = ['Not Started', 'In Progress', 'Completed'];
const PATHS = ['General', 'Pre Security', 'Cyber Security 101', 'Web Fundamentals', 'SOC Level 1', 'Privilege Escalation', 'Active Directory'];

export default function RoomModal({ isOpen, onClose, onSubmit, room }) {
  const [form, setForm] = useState({
    roomName: '',
    category: 'Linux',
    path: 'General',
    difficulty: 'Easy',
    url: '',
    status: 'Not Started',
    roadmapOrder: 999,
  });

  useEffect(() => {
    if (room) {
      setForm({
        roomName: room.roomName || '',
        category: room.category || 'Linux',
        path: room.path || 'General',
        difficulty: room.difficulty || 'Easy',
        url: room.url || '',
        status: room.status || 'Not Started',
        roadmapOrder: room.roadmapOrder || 999,
      });
    } else {
      setForm({
        roomName: '',
        category: 'Linux',
        path: 'General',
        difficulty: 'Easy',
        url: '',
        status: 'Not Started',
        roadmapOrder: 999,
      });
    }
  }, [room, isOpen]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      roadmapOrder: parseInt(form.roadmapOrder) || 999,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative retro-card p-6 w-full max-w-lg animate-fade-in max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl text-white mb-6 border-b-2 border-white pb-2">
          {room ? 'EDIT ROOM' : 'ADD ROOM'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Name */}
          <div>
            <label className="block text-sm text-gray-400 font-bold uppercase mb-1">Room Name *</label>
            <input
              name="roomName"
              value={form.roomName}
              onChange={handleChange}
              required
              className="retro-input w-full"
              placeholder="e.g., Linux Fundamentals Part 1"
            />
          </div>

          {/* Category & Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 font-bold uppercase mb-1">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} className="retro-input w-full">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 font-bold uppercase mb-1">Difficulty *</label>
              <select name="difficulty" value={form.difficulty} onChange={handleChange} className="retro-input w-full">
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Path & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 font-bold uppercase mb-1">Learning Path</label>
              <select name="path" value={form.path} onChange={handleChange} className="retro-input w-full">
                {PATHS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 font-bold uppercase mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="retro-input w-full">
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm text-gray-400 font-bold uppercase mb-1">TryHackMe URL</label>
            <input
              name="url"
              value={form.url}
              onChange={handleChange}
              className="retro-input w-full"
              placeholder="https://tryhackme.com/room/..."
            />
          </div>

          {/* Roadmap Order */}
          <div>
            <label className="block text-sm text-gray-400 font-bold uppercase mb-1">Roadmap Order</label>
            <input
              name="roadmapOrder"
              type="number"
              value={form.roadmapOrder}
              onChange={handleChange}
              className="retro-input w-full"
              placeholder="999"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4 pt-4 border-t-2 border-dotted border-gray-600 mt-6">
            <button type="submit" className="retro-btn flex-1">
              {room ? 'SAVE CHANGES' : 'ADD ROOM'}
            </button>
            <button type="button" onClick={onClose} className="retro-btn-outline w-1/3">
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
