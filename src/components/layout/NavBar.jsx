import { NavLink } from 'react-router-dom';
import { Compass, TreePine, CloudSun, ShieldCheck } from 'lucide-react';
import StartOverButton from './StartOverButton.jsx';

const LINKS = [
  { to: '/', label: 'Route', end: true, icon: Compass },
  { to: '/refuges', label: 'Refuges', icon: TreePine },
  { to: '/forecast', label: 'Forecast', icon: CloudSun },
];

// Active state is never colour alone: the icon+label also gain weight and
// a small dot marker, and NavLink sets aria-current="page" for us.
function linkClasses({ isActive }) {
  return [
    'group flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2.5 text-micro font-medium min-h-[48px]',
    'md:flex-row md:justify-start md:gap-3 md:px-3 md:py-2.5 md:text-caption',
    isActive
      ? 'bg-accent/10 font-semibold text-accent'
      : 'text-ink/70 hover:bg-ink/5 hover:text-ink',
  ].join(' ');
}

function NavIcon({ Icon, isActive }) {
  return (
    <span className="relative">
      <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={isActive ? 2.5 : 2} />
      {isActive && (
        <span
          aria-hidden="true"
          className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-accent md:hidden"
        />
      )}
    </span>
  );
}

export default function NavBar() {
  return (
    <nav aria-label="Main" className="contents">
      {/* Mobile: bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-ink/10 bg-paper/95 backdrop-blur md:hidden">
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={linkClasses}>
            {({ isActive }) => (
              <>
                <NavIcon Icon={link.icon} isActive={isActive} />
                {link.label}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Desktop: persistent left rail */}
      <div className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-60 md:flex-col md:border-r md:border-ink/10 md:p-4">
        <div className="mb-6 flex items-center gap-2 px-1">
          <Compass className="h-6 w-6 text-accent" aria-hidden="true" />
          <span className="text-heading-sm text-ink">Quiet Compass</span>
        </div>
        <div className="flex flex-col gap-1">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClasses}>
              {({ isActive }) => (
                <>
                  <NavIcon Icon={link.icon} isActive={isActive} />
                  {link.label}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <StartOverButton className="mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-caption font-medium text-ink/60 hover:bg-ink/5 hover:text-ink" />

        <div className="mt-4 flex items-start gap-2 rounded-lg bg-accent/5 p-3 text-micro text-ink/70">
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" aria-hidden="true" />
          <span>Session only. Nothing is saved after you close this tab.</span>
        </div>
      </div>
    </nav>
  );
}
