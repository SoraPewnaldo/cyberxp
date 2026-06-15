import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-transparent text-cyber-text font-['Inter'] relative">
      <Topbar />

      {/* Main content area */}
      <div className="min-h-screen pt-24 pb-12 flex justify-center">
        <main className="w-full max-w-5xl px-4 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
