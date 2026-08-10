import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RoutePlanner from '../RoutePlanner.jsx';
import RouteResults from '../RouteResults.jsx';
import { SessionProvider } from '../../context/SessionContext.jsx';

function renderPlanner() {
  return render(
    <SessionProvider>
      <MemoryRouter
        initialEntries={['/']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path="/" element={<RoutePlanner />} />
          <Route path="/routes" element={<RouteResults />} />
        </Routes>
      </MemoryRouter>
    </SessionProvider>,
  );
}

describe('RoutePlanner (AC 1.1.1)', () => {
  it('Scenario 1: generates a route with walking time and distance for a valid CBD origin and destination', async () => {
    const user = userEvent.setup();
    renderPlanner();

    await user.type(screen.getByLabelText('Origin'), 'Melbourne Central');
    await user.type(screen.getByLabelText('Destination'), 'Bourke Street Mall');
    await user.click(screen.getByRole('button', { name: /find route/i }));

    await waitFor(() => expect(screen.getByText('Route Results')).toBeInTheDocument());
    expect(screen.getAllByText(/min/).length).toBeGreaterThan(0);
  });

  it('accepts Southern Cross Station as the explicit transport gateway', async () => {
    const user = userEvent.setup();
    renderPlanner();

    await user.type(screen.getByLabelText('Origin'), 'Southern Cross Station');
    await user.type(screen.getByLabelText('Destination'), 'Bourke Street Mall');
    await user.click(screen.getByRole('button', { name: /find route/i }));

    await waitFor(() => expect(screen.getByText('Route Results')).toBeInTheDocument());
  });

  it('Scenario 3: shows an inline message and does not navigate when the destination is outside the CBD', async () => {
    const user = userEvent.setup();
    renderPlanner();

    await user.type(screen.getByLabelText('Origin'), 'Melbourne Central');
    await user.type(screen.getByLabelText('Destination'), 'St Kilda Beach');
    await user.click(screen.getByRole('button', { name: /find route/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/within Melbourne CBD/i);
    expect(screen.queryByText('Route Results')).not.toBeInTheDocument();
  });

  // Scenario 2 (nearest tram/train stop at origin and destination) is
  // blocked: the backend ingests no public-transport dataset and returns no
  // access-point data. AccessPointCard was removed. See docs/BACKEND_GAPS.md
  // and docs/ACCEPTANCE_CRITERIA.md's implementation-status table.
  it.skip('Scenario 2: shows the nearest tram or train stop at both origin and destination on Route Results', async () => {});

  it('shows an inline message when the typed location does not match any known place', async () => {
    const user = userEvent.setup();
    renderPlanner();

    await user.type(screen.getByLabelText('Origin'), 'Nowhere In Particular');
    await user.type(screen.getByLabelText('Destination'), 'Bourke Street Mall');
    await user.click(screen.getByRole('button', { name: /find route/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /enter a location from the suggestions/i,
    );
  });
});
