import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RouteResults from '../RouteResults.jsx';
import RouteDetail from '../RouteDetail.jsx';
import { SessionProvider } from '../../context/SessionContext.jsx';

// Simulates a page refresh: session state is empty (a real refresh clears
// the in-memory SessionContext - see CLAUDE.md, no localStorage/
// sessionStorage), but the trip survives in the URL query string.
function renderAsIfRefreshed(initialEntry) {
  return render(
    <SessionProvider>
      <MemoryRouter
        initialEntries={[initialEntry]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path="/routes" element={<RouteResults />} />
          <Route path="/routes/:routeId" element={<RouteDetail />} />
        </Routes>
      </MemoryRouter>
    </SessionProvider>,
  );
}

describe('Refresh recovery via URL-encoded trip', () => {
  it('Route Results re-plans from the URL when session state is empty', async () => {
    renderAsIfRefreshed('/routes?o=melbourne-central&d=bourke-street-mall&tol=MEDIUM');

    expect(screen.getByText(/getting your trip back/i)).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.queryByText(/getting your trip back/i)).not.toBeInTheDocument(),
    );
    expect(screen.getAllByText(/min/).length).toBeGreaterThan(0);
  });

  it('Route Results shows the empty state when there is no trip in the URL', () => {
    renderAsIfRefreshed('/routes');

    expect(
      screen.getByText('No route planned yet. Enter an origin and destination to see your options.'),
    ).toBeInTheDocument();
  });

  it('Route Detail re-plans from the URL and recovers a route', async () => {
    renderAsIfRefreshed('/routes/1?o=melbourne-central&d=bourke-street-mall&tol=MEDIUM');

    expect(await screen.findByText('Melbourne Central → Bourke Street Mall')).toBeInTheDocument();
  });

  it('Route Detail shows "could not find" when there is no trip in the URL to recover from', () => {
    renderAsIfRefreshed('/routes/1');

    expect(screen.getByText("We couldn't find that route.")).toBeInTheDocument();
  });
});
