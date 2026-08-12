import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import RoutePlanner from '../RoutePlanner.jsx';
import RouteResults from '../RouteResults.jsx';
import RouteDetail from '../RouteDetail.jsx';
import NavBar from '../../components/layout/NavBar.jsx';
import { SessionProvider } from '../../context/SessionContext.jsx';
import * as routesApi from '../../api/routes.js';

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
}

function renderApp() {
  return render(
    <SessionProvider>
      <MemoryRouter
        initialEntries={['/']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <NavBar />
        <LocationProbe />
        <Routes>
          <Route path="/" element={<RoutePlanner />} />
          <Route path="/routes" element={<RouteResults />} />
          <Route path="/routes/:routeId" element={<RouteDetail />} />
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
    expect(screen.getByTestId('location')).toHaveTextContent('tol=LOW');
  });

  it('keeps the check-in open and the existing plan unchanged when re-evaluation fails', async () => {
    const user = userEvent.setup();
    renderApp();
    await planAndReachResults(user);

    await user.click(screen.getAllByRole('button', { name: /select this route/i })[0]);
    vi.spyOn(routesApi, 'planRoute').mockRejectedValueOnce(new Error('Unable to re-evaluate'));
    await user.click(screen.getByRole('button', { name: 'Very sensitive today' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to re-evaluate');
    expect(screen.getByText('Route Results')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: /how are you feeling/i })).toBeInTheDocument();
    expect(screen.getByTestId('location')).not.toHaveTextContent('/routes/1');

    vi.restoreAllMocks();
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

  it('shows the check-in again on every route selection this session', async () => {
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
    expect(screen.getByRole('dialog', { name: /how are you feeling/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Skip' }));
    await waitFor(() => expect(screen.getByText('Route Detail')).toBeInTheDocument());
  });
});
