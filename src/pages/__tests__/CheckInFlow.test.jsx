import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RoutePlanner from '../RoutePlanner.jsx';
import RouteResults from '../RouteResults.jsx';
import RouteDetail from '../RouteDetail.jsx';
import NavBar from '../../components/layout/NavBar.jsx';
import { SessionProvider } from '../../context/SessionContext.jsx';

function renderApp() {
  return render(
    <SessionProvider>
      <MemoryRouter
        initialEntries={['/']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <NavBar />
        <Routes>
          <Route path="/" element={<RoutePlanner />} />
          <Route path="/routes" element={<RouteResults />} />
          <Route path="/routes/:id" element={<RouteDetail />} />
        </Routes>
      </MemoryRouter>
    </SessionProvider>,
  );
}

async function planAndReachResults(user) {
  await user.type(screen.getByLabelText('Origin'), 'Melbourne Central');
  await user.type(screen.getByLabelText('Destination'), 'Bourke Street Mall');
  await user.click(screen.getByRole('button', { name: /find route/i }));
  await waitFor(() => expect(screen.getByText('Route Results')).toBeInTheDocument());
}

describe('Check-in to Route Detail flow (AC 1.3.1)', () => {
  it('Scenario 1: completing the check-in re-evaluates results and continues to Route Detail', async () => {
    const user = userEvent.setup();
    renderApp();
    await planAndReachResults(user);

    const [selectFirstRoute] = screen.getAllByRole('button', { name: /select this route/i });
    await user.click(selectFirstRoute);

    expect(screen.getByRole('dialog', { name: /how are you feeling/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Very sensitive today' }));

    await waitFor(() => expect(screen.getByText('Route Detail')).toBeInTheDocument());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Scenario 2: dismissing the check-in keeps the default tolerance and continues unchanged', async () => {
    const user = userEvent.setup();
    renderApp();
    await planAndReachResults(user);

    const [selectFirstRoute] = screen.getAllByRole('button', { name: /select this route/i });
    await user.click(selectFirstRoute);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Skip' }));

    await waitFor(() => expect(screen.getByText('Route Detail')).toBeInTheDocument());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not show the check-in again once it has been seen this session', async () => {
    const user = userEvent.setup();
    renderApp();
    await planAndReachResults(user);

    await user.click(screen.getAllByRole('button', { name: /select this route/i })[0]);
    await user.click(screen.getByRole('button', { name: 'Skip' }));
    await waitFor(() => expect(screen.getByText('Route Detail')).toBeInTheDocument());

    // Re-plan the same trip to get back to Route Results within the same session.
    await user.click(screen.getAllByRole('link', { name: 'Route' })[0]);
    await planAndReachResults(user);

    await user.click(screen.getAllByRole('button', { name: /select this route/i })[0]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Route Detail')).toBeInTheDocument());
  });
});
