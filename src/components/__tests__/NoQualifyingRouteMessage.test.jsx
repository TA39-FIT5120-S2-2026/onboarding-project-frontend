import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RoutePlanner from '../../pages/RoutePlanner.jsx';
import RouteResults from '../../pages/RouteResults.jsx';
import RouteDetail from '../../pages/RouteDetail.jsx';
import { SessionProvider } from '../../context/SessionContext.jsx';

function renderApp() {
  return render(
    <SessionProvider>
      <MemoryRouter
        initialEntries={['/']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path="/" element={<RoutePlanner />} />
          <Route path="/routes" element={<RouteResults />} />
          <Route path="/routes/:id" element={<RouteDetail />} />
        </Routes>
      </MemoryRouter>
    </SessionProvider>,
  );
}

describe('NoQualifyingRouteMessage (AC 1.3.3)', () => {
  it('states no route meets the strictest tolerance during peak hour and labels the fallback honestly', async () => {
    const user = userEvent.setup();
    renderApp();

    // Flinders Street Station is the fixture's peak-hour destination: every
    // route is MEDIUM or HIGH, so a LOW tolerance leaves nothing qualifying.
    await user.type(screen.getByLabelText('Origin'), 'Melbourne Central');
    await user.type(screen.getByLabelText('Destination'), 'Flinders Street Station');
    await user.click(screen.getByRole('button', { name: /find route/i }));
    await waitFor(() => expect(screen.getByText('Route Results')).toBeInTheDocument());

    const [selectFirstRoute] = screen.getAllByRole('button', { name: /select this route/i });
    await user.click(selectFirstRoute);
    await user.click(screen.getByRole('button', { name: 'Very sensitive today' }));
    await waitFor(() => expect(screen.getByText('Route Detail')).toBeInTheDocument());

    const message = screen.getByRole('alert');
    expect(message).toHaveTextContent(/no route meets your tolerance/i);
    expect(screen.getByText('Does not meet your tolerance')).toBeInTheDocument();

    // Honest fallback, not presented as compliant: no Recommended badge,
    // and no "use this route instead" switch (there is nothing to switch to).
    expect(screen.queryByText('Recommended')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /use this route instead/i }),
    ).not.toBeInTheDocument();
  });
});
