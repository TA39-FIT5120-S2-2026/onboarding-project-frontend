import NavBar from './NavBar.jsx';

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-paper text-ink md:flex">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <NavBar />
      <main
        id="main-content"
        className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-8 md:pt-8"
        tabIndex={-1}
      >
        {children}
      </main>
    </div>
  );
}
