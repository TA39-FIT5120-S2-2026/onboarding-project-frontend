import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RoutePlanner from '../RoutePlanner.jsx';
import RouteResults from '../RouteResults.jsx';
import RouteDetail from '../RouteDetail.jsx';
import Forecast from '../Forecast.jsx';
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
          <Route path="/routes/:routeId" element={<RouteDetail />} />
          <Route path="/forecast" element={<Forecast />} />
        </Routes>
      </MemoryRouter>
    </SessionProvider>,
  );
}

async function planSelectAndReturn(user, destination) {
  await user.type(screen.getByLabelText('Origin'), 'Melbourne Central');
  await user.type(screen.getByLabelText('Destination'), destination);
  await user.click(screen.getByRole('button', { name: /find route/i }));
  await waitFor(() => expect(screen.getByText('Route Results')).toBeInTheDocument());

  const [selectFirstRoute] = screen.getAllByRole('button', { name: /select this route/i });
  await user.click(selectFirstRoute);
  await user.click(screen.getByRole('button', { name: 'Skip' }));
  await waitFor(() => expect(screen.getByText('Route Detail')).toBeInTheDocument());

  await user.click(screen.getAllByRole('link', { name: 'Route' })[0]);
  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'Quiet Compass' })).toBeInTheDocument(),
  );
}

describe('PredictiveAlert on Route Planner (AC 2.2.3)', () => {
  it('shows no alert before any route has been selected this session', () => {
    renderApp();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('alerts when the next-hour forecast for the selected route is HIGH, with location, period, estimate wording and a forecast link', async () => {
    const user = userEvent.setup();
    renderApp();

    await planSelectAndReturn(user, 'Bourke Street Mall');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Bourke Street Mall');
    expect(alert).toHaveTextContent('14:30-14:45');
    expect(alert).toHaveTextContent(/estimate based on historical patterns/i);

    const link = screen.getByRole('link', { name: /view forecast/i });
    expect(link).toHaveAttribute('href', '/forecast');

    await user.click(link);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Forecast' })).toBeInTheDocument(),
    );
  });

  it('shows no alert when the forecast is not HIGH (insufficient history at this location)', async () => {
    const user = userEvent.setup();
    renderApp();

    await planSelectAndReturn(user, 'Docklands Library');

    // No positive UI change to wait for on the "no alert" path, so give the
    // forecast fetch's fixture delay time to settle before asserting absence.
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
