import { NavLink } from 'react-router-dom';

const navItems = [
  { name: 'Stats', path: '/dashboard' },
  { name: 'Missions', path: '/roadmap' },
  { name: 'CyberXP', path: '/dashboard', isBrand: true }, // The brand logo in the middle
  { name: 'Store', path: '/achievements' },
  { name: 'Settings', path: '/settings' },
];

export default function Topbar() {
  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="retro-card !rounded-full !py-2 md:!py-3 !px-4 md:!px-8 flex items-center w-full max-w-4xl shadow-2xl">
        <ul className="flex items-center justify-between w-full font-['VT323'] uppercase text-base sm:text-lg md:text-2xl text-white">
          {navItems.map((item) => (
            <li key={item.name} className={item.isBrand ? 'hidden md:block' : ''}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `px-1.5 sm:px-3 py-1 transition-all duration-300 hover:text-[var(--color-cyber-primary)] hover:drop-shadow-[0_0_8px_var(--color-cyber-primary)] ${
                    isActive && !item.isBrand ? 'text-[var(--color-cyber-primary)] border-b-2 border-[var(--color-cyber-primary)] drop-shadow-[0_0_5px_var(--color-cyber-primary)]' : ''
                  } ${item.isBrand ? 'font-bold text-2xl md:text-3xl tracking-widest text-white hover:!text-white' : ''}`
                }
              >
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
