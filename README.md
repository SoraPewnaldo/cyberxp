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

## 🌐 Hosting & Deployment Guide

As a full-stack application (statically served frontend + dynamic backend server with SQLite), deployment is divided into two parts:

### 1. Host Frontend (React) on GitHub Pages
You can host the React client for free directly on GitHub Pages.

1.  **Configure API URL**: In `client/src/api/axios.js`, ensure the Axios base URL points to your deployed backend URL instead of `http://localhost:5000`.
2.  **Add Homepage**: Add `"homepage": "https://<your-username>.github.io/cyberxp"` to your `client/package.json`.
3.  **Install gh-pages**:
    ```bash
    cd client
    npm install gh-pages --save-dev
    ```
4.  **Add Deploy Scripts**: Add these scripts in `client/package.json`:
    ```json
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
    ```
5.  **Deploy**: Run `npm run deploy` inside the `client` directory to build and publish your app!

---

### 2. Host Backend (Express + SQLite)
Since the backend uses a local SQLite file (`server/data/cyberxp.db`) to store progress, hosting requires a platform with **persistent disk storage**:

*   **Render** / **Railway** / **Fly.io**: 
    1. Deploy the `server` directory as a Web Service.
    2. Add a persistent **Disk Volume** mounted at `/opt/render/project/src/server/data` (or your service's equivalent database path).
    3. Set the environment variable `PORT` to default config.
*   **VPS (Virtual Private Server)**: You can clone the repository to a VPS (e.g. DigitalOcean, Linode), configure `pm2` to run the server in the background, and use Nginx to reverse proxy port `5000`.

---

## 🤝 Credits

The list of TryHackMe rooms, paths, and URLs used in this application is seeded from the excellent open-source curation repository:
*   **Repository**: [Hunterdii/tryhackme-free-rooms](https://github.com/Hunterdii/tryhackme-free-rooms)
*   **Creator**: [@Hunterdii](https://github.com/Hunterdii)

We thank them for compiling and curating this collection of free learning resources!

---

## 📄 License

This project is licensed under the MIT License.
