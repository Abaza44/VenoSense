import { Link, useLocation } from 'react-router-dom';
import { APP_NAME, APP_VERSION } from '../../utils/constants';

export default function Header() {
  const location = useLocation();

  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-600/50 bg-surface-900/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          {/* Animated vein icon */}
          <div className="w-9 h-9 rounded-lg bg-vein-400/15 border border-vein-400/30 flex items-center justify-center group-hover:shadow-vein transition-shadow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" className="animate-pulse-glow" />
            </svg>
          </div>
          <div>
            <span className="font-display font-bold text-lg tracking-wider text-white">
              {APP_NAME}
            </span>
            <span className="ml-1.5 text-xs font-mono text-vein-400">v{APP_VERSION}</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <NavLink to="/" active={isHome}>
            Dashboard
          </NavLink>
          <NavLink to="/ar" active={location.pathname === '/ar'}>
            AR Scanner
          </NavLink>
          <NavLink to="/recommend" active={location.pathname === '/recommend'}>
            Recommender
          </NavLink>
          <NavLink to="/patients" active={location.pathname === '/patients'}>
            VeinMap
          </NavLink>
        </nav>

        {/* Status indicator */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-gray-500 font-mono">SYSTEM ONLINE</span>
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
        ${active
          ? 'bg-vein-400/15 text-vein-400'
          : 'text-gray-400 hover:text-white hover:bg-surface-700'
        }`}
    >
      {children}
    </Link>
  );
}
