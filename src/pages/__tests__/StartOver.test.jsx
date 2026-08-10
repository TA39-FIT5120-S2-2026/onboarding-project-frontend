import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RoutePlanner from '../RoutePlanner.jsx';
import RouteResults from '../RouteResults.jsx';
import RouteDetail from '../RouteDetail.jsx';
import AppShell from '../../components/layout/AppShell.jsx';
import { SessionProvider } from '../../context/SessionContext.jsx';

function renderApp() {
  return render(
    <SessionProvider>
      <MemoryRouter
        initialEntries={['/']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AppShell>
          <Routes>
            <Route path="/" element={<RoutePlanner />} />
            <Route path="/routes" element={<RouteResults />} />
            <Route path="/routes/:id" element={<RouteDetail />} />
          </Routes>
        </AppShell>
      </MemoryRouter>
    </SessionProvider>,
  );
}

describe('Start over', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('clears the planned trip and returns to the Route Planner when confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText('Origin'), 'Melbourne Central');
    await user.type(screen.getByLabelText('Destination'), 'Bourke Street Mall');
    await user.click(screen.getByRole('button', { name: /find route/i }));
    await waitFor(() => expect(screen.getByText('Route Results')).toBeInTheDocument());

    await user.click(screen.getAllByRole('button', { name: /start over/i })[0]);

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Quiet Compass' })).toBeInTheDocument(),
    );

    // Session cleared: going straight to /routes now shows the empty state.
    expect(screen.queryByText('Route Results')).not.toBeInTheDocument();
  });

  it('does nothing when the confirmation is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();
    renderApp();

    await user.type(screen.getByLabelText('Origin'), 'Melbourne Central');
    await user.type(screen.getByLabelText('Destination'), 'Bourke Street Mall');
    await user.click(screen.getByRole('button', { name: /find route/i }));
    await waitFor(() => expect(screen.getByText('Route Results')).toBeInTheDocument());

    await user.click(screen.getAllByRole('button', { name: /start over/i })[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(screen.getByText('Route Results')).toBeInTheDocument();
  });
});
