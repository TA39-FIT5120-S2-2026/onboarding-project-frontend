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

function renderApp(initialEntry = '/') {
  return render(
    <SessionProvider>
      <MemoryRouter
        initialEntries={[initialEntry]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <NavBar />
        <Routes>
          <Route path="/" element={<RoutePlanner />} />
          <Route path="/routes" element={<RouteResults />} />
          <Route path="/routes/:id" element={<RouteDetail />} />
          <Route path="/forecast" element={<Forecast />} />
        </Routes>
      </MemoryRouter>
    </SessionProvider>,
  );
}

async function chooseLocation(user, locationText) {
  await user.type(screen.getByLabelText('Area or sensor location'), locationText);
  await user.click(screen.getByRole('button', { name: /show forecast/i }));
}

describe('Forecast (AC 2.2.1)', () => {
  it('prompts for an area or sensor location when none is active', () => {
    renderApp('/forecast');

    expect(screen.getByRole('heading', { name: 'Forecast' })).toBeInTheDocument();
    expect(screen.getByLabelText('Area or sensor location')).toBeInTheDocument();
  });

  it('shows a next-hour timeline labelled as an estimate, distinguished from live readings', async () => {
    const user = userEvent.setup();
    renderApp('/forecast');

    await chooseLocation(user, 'Melbourne Central');

    await waitFor(() => expect(screen.getByText('Estimated')).toBeInTheDocument());
    expect(screen.getByText('Estimate based on historical patterns.')).toBeInTheDocument();

    // 60 minutes ahead, in 15-minute steps, from forecast.json.
    expect(screen.getByText('In 15 minutes (est.)')).toBeInTheDocument();
    expect(screen.getByText('In 60 minutes (est.)')).toBeInTheDocument();

    // No active route this session, so there is nothing live to distinguish from.
    expect(screen.queryByText('Now (live)')).not.toBeInTheDocument();
  });

  it('shows "Not enough historical data" when sufficientHistory is false', async () => {
    const user = userEvent.setup();
    renderApp('/forecast');

    await chooseLocation(user, 'Docklands Library');

    expect(
      await screen.findByText('Not enough historical data for this location.'),
    ).toBeInTheDocument();
  });

  it('shows the live count as a distinct "Now" value when a route is active this session', async () => {
    const user = userEvent.setup();
    renderApp('/');

    await user.type(screen.getByLabelText('Origin'), 'Melbourne Central');
    await user.type(screen.getByLabelText('Destination'), 'Bourke Street Mall');
    await user.click(screen.getByRole('button', { name: /find route/i }));
    await waitFor(() => expect(screen.getByText('Route Results')).toBeInTheDocument());

    const [selectFirstRoute] = screen.getAllByRole('button', { name: /select this route/i });
    await user.click(selectFirstRoute);
    await user.click(screen.getByRole('button', { name: 'Skip' }));
    await waitFor(() => expect(screen.getByText('Route Detail')).toBeInTheDocument());

    // The session already has a destination (Bourke Street Mall) from
    // planning the route above, so Forecast loads straight in - no prompt.
    await user.click(screen.getAllByRole('link', { name: 'Forecast' })[0]);

    await waitFor(() => expect(screen.getByText('38 counts / min')).toBeInTheDocument());
    expect(screen.getAllByText('Now (live)').length).toBeGreaterThan(0);
  });
});
