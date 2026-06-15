import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Spline from '@splinetool/react-spline';
import { SettingsProvider } from './context/SettingsContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import Achievements from './pages/Achievements';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

export default function App() {
  return (
    <SettingsProvider>
      {/* 3D Spline Background Layer */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <Spline scene="/scene-clean.splinecode" />
      </div>

      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </SettingsProvider>
  );
}
