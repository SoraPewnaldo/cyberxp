import { useState, useEffect, useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';
import API from '../api/axios';
import RoomCard from '../components/RoomCard';
import RoomModal from '../components/RoomModal';

const CATEGORIES = ['All', 'General', 'Linux', 'Windows', 'Networking', 'Cryptography', 'Web', 'Forensics', 'PrivEsc', 'Active Directory', 'CTF'];
const STATUSES = ['All', 'Not Started', 'In Progress', 'Completed'];

export default function Roadmap() {
  const { fetchSettings } = useSettings();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchRooms = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (statusFilter !== 'All') params.status = statusFilter;

      const { data } = await API.get('/rooms', { params });
      setRooms(data);
    } catch (error) {
      console.error('Fetch rooms error:', error);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddRoom = () => {
    setEditingRoom(null);
    setModalOpen(true);
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingRoom) {
        await API.put(`/rooms/${editingRoom.id || editingRoom._id}`, formData);
        showNotification('Room updated successfully');
      } else {
        await API.post('/rooms', formData);
        showNotification('Room added successfully');
      }
      setModalOpen(false);
      setEditingRoom(null);
      fetchRooms();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error saving room', 'error');
    }
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      await API.delete(`/rooms/${roomId}`);
      showNotification('Room deleted');
      fetchRooms();
    } catch (error) {
      showNotification('Error deleting room', 'error');
    }
  };

  const handleComplete = async (roomId) => {
    try {
      const { data } = await API.put(`/rooms/${roomId}/complete`);
      showNotification(`Room completed! +${data.xpAwarded} XP 🎉`);
      if (data.newAchievements?.length > 0) {
        data.newAchievements.forEach((a) => {
          setTimeout(() => showNotification(`🏆 Achievement unlocked: ${a.title}!`), 1000);
        });
      }
      fetchRooms();
      fetchSettings();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Error completing room', 'error');
    }
  };

  const handleStart = async (roomId) => {
    try {
      await API.put(`/rooms/${roomId}`, { status: 'In Progress' });
      showNotification('Room started! Good luck 🚀');
      fetchRooms();
    } catch (error) {
      showNotification('Error starting room', 'error');
    }
  };

  // Group rooms by path
  const groupedRooms = rooms.reduce((acc, room) => {
    const path = room.path || 'General';
    if (!acc[path]) acc[path] = [];
    acc[path].push(room);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="font-['VT323'] text-2xl animate-blink text-white">LOADING MAP...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 border-2 shadow-lg animate-fade-in font-['VT323'] text-xl uppercase ${
            notification.type === 'error'
              ? 'bg-black border-red-600 text-red-600'
              : 'bg-black border-white text-white'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-white pb-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white uppercase">Roadmap</h1>
          <p className="text-gray-400 mt-2 font-mono uppercase text-sm">
            {rooms.length} rooms detected
          </p>
        </div>
        <button onClick={handleAddRoom} className="retro-btn">
          ADD ROOM
        </button>
      </div>

      {/* Filters */}
      <div className="retro-card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH ROOMS..."
              className="retro-input"
            />
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 font-bold uppercase transition-all border text-xs font-mono rounded-md ${
                  categoryFilter === cat
                    ? 'bg-[var(--color-cyber-primary)] text-white border-[var(--color-cyber-primary)] shadow-[0_0_10px_var(--color-cyber-primary)]'
                    : 'bg-black/40 text-gray-400 border-white/20 hover:text-white hover:border-white/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Status filter */}
        <div className="flex gap-2 mt-4 border-t-2 border-dotted border-gray-600 pt-4">
          {STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 font-bold uppercase transition-all border text-xs font-mono rounded-md ${
                statusFilter === status
                  ? 'bg-[var(--color-cyber-primary)] text-white border-[var(--color-cyber-primary)] shadow-[0_0_10px_var(--color-cyber-primary)]'
                  : 'bg-black/40 text-gray-400 border-white/20 hover:text-white hover:border-white/50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms grouped by path */}
      {Object.keys(groupedRooms).length > 0 ? (
        Object.entries(groupedRooms).map(([path, pathRooms]) => (
          <div key={path} className="mb-8">
            <h2 className="text-3xl text-white mb-4 border-b-2 border-white pb-2 flex items-center justify-between">
              <span>{path}</span>
              <span className="font-['VT323'] text-2xl text-gray-400">
                ({pathRooms.filter((r) => r.status === 'Completed').length}/{pathRooms.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {pathRooms.map((room) => (
                <RoomCard
                  key={room.id || room._id}
                  room={room}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onComplete={handleComplete}
                  onStart={handleStart}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="retro-card text-center py-12">
          <span className="text-6xl mb-4 block grayscale">📭</span>
          <p className="text-white font-bold text-2xl font-['VT323'] uppercase">No rooms found</p>
          <p className="text-gray-500 mt-2 font-mono uppercase text-sm">Adjust filters or add a new room</p>
        </div>
      )}

      {/* Modal */}
      <RoomModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingRoom(null);
        }}
        onSubmit={handleSubmit}
        room={editingRoom}
      />
    </div>
  );
}
