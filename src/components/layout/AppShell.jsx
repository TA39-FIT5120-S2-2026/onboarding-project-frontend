import { Compass } from 'lucide-react';
import NavBar from './NavBar.jsx';
import StartOverButton from './StartOverButton.jsx';

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-paper text-ink md:flex">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Mobile: slim top bar with brand + reset (the rail covers this on desktop) */}
      <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3 md:hidden">
        <span className="flex items-center gap-2 text-heading-sm text-ink">
          <Compass className="h-5 w-5 text-accent" aria-hidden="true" />
          Quiet Compass
        </span>
        <StartOverButton className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-micro font-medium text-ink/60 hover:bg-ink/5" />
      </div>

      <NavBar />
      <main
        id="main-content"
        className="flex-1 px-4 pb-28 pt-6 md:px-10 md:pb-12 md:pt-10"
        tabIndex={-1}
      >
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
