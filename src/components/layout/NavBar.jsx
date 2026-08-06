import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/', label: 'Route', end: true },
  { to: '/refuges', label: 'Refuges' },
  { to: '/forecast', label: 'Forecast' },
];

function linkClasses({ isActive }) {
  return [
    'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium',
    'md:flex-row md:justify-start md:gap-3 md:px-4 md:py-3 md:text-base',
    isActive ? 'text-accent bg-accent/10' : 'text-ink/70 hover:text-ink',
  ].join(' ');
}

export default function NavBar() {
  return (
    <nav aria-label="Main" className="contents">
      {/* Mobile: bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-ink/10 bg-paper/95 backdrop-blur md:hidden">
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={linkClasses}>
            {link.label}
          </NavLink>
        ))}
      </div>
      {/* Desktop: left rail */}
      <div className="hidden md:flex md:w-56 md:flex-col md:gap-1 md:border-r md:border-ink/10 md:p-4">
        <span className="mb-4 text-lg font-semibold text-ink">Quiet Compass</span>
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={linkClasses}>
            {link.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
