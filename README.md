# 🛡️ CyberXP

### Duolingo for Cybersecurity

*   Track TryHackMe Progress
*   Earn XP
*   Unlock Achievements
*   Measure Internship Readiness (Knowledge Percentage)
*   Follow Guided Learning Paths

**Built with React, Express, and PostgreSQL (Supabase)**

---

## 📸 Screenshots

### 📊 Dashboard & Stats
![Dashboard](Screenshots/Stats.png)

### 🛣️ Skill Tree Roadmap
![Roadmap](Screenshots/Missions.png)

### 🏆 Achievements (50+ Trophies)
![Achievements](Screenshots/Achievements.png)

---

## 🎮 Features

*   **⚡ XP & Leveling System**: Earn XP for completed rooms (Easy +10 XP, Medium +25 XP, Hard +50 XP) and level up dynamically.
*   **🔥 Streak Tracking**: Monitors daily activity and maintains active combos to motivate consistent practice.
*   **🏆 50+ Achievements**: Unlock unique, cybersecurity-themed milestone badges as you learn.
*   **🧠 Knowledge Percentage (Internship Readiness)**: Analyzes your skill distribution across domains (Linux, Windows, Web, Forensics, CTFs, etc.) to give a weighted readiness score.
*   **🎯 Smart Recommendations**: Suggests the next best room to attempt based on difficulty and path sequencing.
*   **🗺️ Interactive Roadmap**: Search, filter, and track rooms grouped by path and categories.
*   **📚 Cheat Sheet Library**: High-quality references for Linux, Nmap, Burp Suite, and SQL Injection with copy-to-clipboard buttons.
*   **🔮 Glassmorphism UI**: Premium visual aesthetics, featuring micro-animations and an interactive 3D Spline background.

---

## 🚀 Cloning & Local Development

Follow these steps to run your own copy of CyberXP locally:

### Prerequisites
*   **Node.js 18+**
*   A **PostgreSQL Database** (e.g. a free instance on [Supabase](https://supabase.com))

### 1. Clone the Repository
```bash
git clone https://github.com/SoraPewnaldo/cyberxp.git
cd cyberxp
```

### 2. Install Dependencies
Install dependencies for both the frontend client and the backend server:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Configure the Environment
Create a `.env` file inside the `server` directory and set the environment variables:
```ini
PORT=5000
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database>
```
*Note: Make sure to use an IPv4-compatible connection string (like the Supabase Connection Pooler URI on port `5432` or `6543`) if you run into IPv6 resolution issues on your network.*

### 4. Run the Project
Start the backend server and frontend client concurrently:

#### Terminal 1: Start Backend
```bash
cd server
npm run dev
```
*Note: On first startup, the database tables will be auto-created and seeded with all 483 rooms and 50 achievements.*

#### Terminal 2: Start Frontend
```bash
cd client
npm run dev
```
*   **Local Web App Access**: http://localhost:3000

---

## 🛠️ Detailed Self-Hosting Guide

You can host your own production copy of CyberXP online for free by deploying the frontend to GitHub Pages and the backend to Render.

### Part 1: Deploying the Backend (Express) on Render
Because CyberXP uses PostgreSQL, you **do not need a persistent disk** on Render! The app is stateless and stores all its progress in the cloud database.

1.  Create a free account on **[Supabase](https://supabase.com)** and spin up a new project.
2.  Get your **IPv4 Connection Pooler String**:
    *   Navigate to your Supabase project dashboard -> click the green **Connect** button at the top center.
    *   Select the **Direct** connection string tab.
    *   Choose **Session Pooler** as the Connection Method and set Type to **URI**.
    *   Copy the URI string (it resolves to IPv4 which is required by Render).
3.  Create a free account on **[Render.com](https://render.com)**.
4.  Click **New +** > **Web Service** and connect your cloned GitHub repository.
5.  Set the following configuration settings:
    *   **Root Directory**: `server`
    *   **Runtime/Language**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm run start` (or `node server.js`)
    *   **Instance Type**: `Free`
6.  Go to the **Environment** tab on Render and add the environment variable:
    *   **Key**: `DATABASE_URL`
    *   **Value**: Your copied Session Pooler URI (replace `[YOUR-PASSWORD]` with your database password).
7.  Deploy the service. Render will start the server and run database seeding automatically. Copy the live Web Service URL (e.g., `https://your-backend.onrender.com`).

### Part 2: Deploying the Frontend (React) on GitHub Pages
1.  Open `client/src/api/axios.js` and update the production URL fallback to point to your live Render backend URL:
    ```javascript
    const API = axios.create({
      baseURL: import.meta.env.DEV ? '/api' : 'https://your-backend.onrender.com/api'
    });
    ```
2.  Open `client/package.json` and change the homepage property to match your GitHub username and repository name:
    ```json
    "homepage": "https://<your-github-username>.github.io/<your-repo-name>"
    ```
3.  Open `client/vite.config.js` and update the build base path to match your repository name:
    ```javascript
    export default defineConfig({
      base: '/<your-repo-name>/',
      // ...
    });
    ```
4.  Deploy your static app to GitHub Pages by running this command inside the `client` folder:
    ```bash
    cd client
    npm run deploy
    ```
    *(This compiles your production assets and uploads them to the `gh-pages` branch automatically).*
5.  Go to your GitHub repository **Settings** > **Pages** and ensure the deployment source branch is set to **`gh-pages`**.

---

## 🛣️ Roadmap & Project Structure

### Project File Map
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

### Future Milestones
*   [ ] Add customizable user profiles and custom avatars.
*   [ ] Integrate local storage caching to minimize Render free tier spin-down lag.
*   [ ] Add interactive custom quizzes to verify room completion knowledge.
*   [ ] Integrate automated syncing with TryHackMe public API profiles.

---

## 🤝 Credits

The list of TryHackMe rooms, paths, and URLs used in this application is seeded from:
*   **Repository**: [Hunterdii/tryhackme-free-rooms](https://github.com/Hunterdii/tryhackme-free-rooms) by [@Hunterdii](https://github.com/Hunterdii)

---

## 📄 License

This project is licensed under the MIT License.
