# 🥷 CyberXP — Gamified Cybersecurity Learning Tracker

CyberXP is a premium, retro-futuristic gamified learning tracker designed to organize, monitor, and accelerate your cybersecurity learning journey. It parses and tracks progress across a list of 500+ free TryHackMe rooms, providing XP, leveling, consecutive-day streak tracking, a variety of unlocked achievements, and internship readiness analysis.

The UI is built with a sleek, interactive glassmorphic theme and featuring an immersive 3D Spline scene in the background.

---

## 🚀 Key Features

*   **⚡ XP & Leveling System**: Earn XP for completed rooms (Easy +10 XP, Medium +25 XP, Hard +50 XP) and level up dynamically.
*   **🔥 Streak Tracking**: Monitors daily activity and maintains active combos to motivate consistent practice.
*   **🏆 50+ Achievements**: Unlock unique, cybersecurity-themed milestone badges as you learn.
*   **🎓 Internship Readiness Analytics**: Analyzes your skill distribution across domains (Linux, Windows, Web, Forensics, CTFs, etc.) to give a weighted readiness score.
*   **🎯 Smart Recommendations**: Suggests the next best room to attempt based on difficulty and path sequencing.
*   **🗺️ Interactive Roadmap**: Search, filter, and track rooms grouped by path and categories.
*   **🔮 Stunning Glassmorphism UI**: Premium visual aesthetics, featuring micro-animations and an interactive 3D Spline background.

---

## 🛠️ Tech Stack

*   **Frontend**: React 19, Vite, TailwindCSS v4, React Router, Axios, `@splinetool/react-spline`
*   **Backend**: Node.js, Express.js
*   **Database**: Native `node:sqlite` (introduced in Node.js 22.5+) — zero-config, ultra-fast, local SQL database with no external MongoDB or SQLite wrapper dependencies.

---

## 📁 Project Structure

```
├── server/          # Express API & SQLite Database
│   ├── config/      # SQLite DB configuration and seed checker
│   ├── controllers/ # Room, Achievement, Analytics, and Settings controllers
│   ├── data/        # Generated SQLite database file (cyberxp.db)
│   ├── routes/      # API endpoints
│   ├── scripts/     # Seeder scripts
│   └── utils/       # XP, leveling, and achievement engine
├── client/          # Vite + React Frontend
│   └── src/
│       ├── api/         # Axios instance configurations
│       ├── components/  # Glassmorphic UI components (Stats, Gauge, Cards)
│       ├── context/     # Global Settings & Profile context
│       ├── pages/       # Dashboard, Roadmap, Achievements, Analytics, Settings
│       └── utils/       # Level calculation helpers
```

---

## ⚙️ Installation & Setup

### Prerequisites

*   **Node.js 22.5+** is required to run the backend (as it relies on the built-in, native `node:sqlite` module).

### 1. Clone & Install Dependencies

Clone the repository and install dependencies for both the frontend and backend:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

Create a `.env` file in the `server` directory (you can copy `.env.example` as a template):

```ini
PORT=5000
```

### 3. Run the Application

Start both the backend server and frontend client.

#### Start the Server (Terminal 1):
```bash
cd server
npm run dev
```
*The database (`server/data/cyberxp.db`) will automatically initialize and seed itself on first run.*

#### Start the Client (Terminal 2):
```bash
cd client
npm run dev
```

*   **Frontend Access**: http://localhost:3000
*   **Backend API Health**: http://localhost:5000/api/health

---

## 🤝 Credits

The list of TryHackMe rooms, paths, and URLs used in this application is seeded from the excellent open-source curation repository:
*   **Repository**: [Hunterdii/tryhackme-free-rooms](https://github.com/Hunterdii/tryhackme-free-rooms)
*   **Creator**: [@Hunterdii](https://github.com/Hunterdii)

We thank them for compiling and curating this collection of free learning resources!

---

## 📄 License

This project is licensed under the MIT License.
