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
        className="flex-1 px-4 pb-28 pt-6 md:px-10 md:pb-12 md:pt-10"
        tabIndex={-1}
      >
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
