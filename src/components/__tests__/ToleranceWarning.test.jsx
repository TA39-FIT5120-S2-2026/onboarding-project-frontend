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
          <Route path="/routes/:routeId" element={<RouteDetail />} />
        </Routes>
      </MemoryRouter>
    </SessionProvider>,
  );
}

async function planAndSelectRoute(user, routeIndex) {
  await user.type(screen.getByLabelText('Origin'), 'Melbourne Central');
  await user.type(screen.getByLabelText('Destination'), 'Bourke Street Mall');
  await user.click(screen.getByRole('button', { name: /find route/i }));
  await waitFor(() => expect(screen.getByText('Route Results')).toBeInTheDocument());

  const selectButtons = screen.getAllByRole('button', { name: /select this route/i });
  await user.click(selectButtons[routeIndex]);
  await user.click(screen.getByRole('button', { name: 'Skip' }));
  await waitFor(() => expect(screen.getByText('Route Detail')).toBeInTheDocument());
}

describe('ToleranceWarning (AC 1.3.2)', () => {
  it('warns which route exceeds tolerance and offers a one-tap alternative within tolerance', async () => {
    const user = userEvent.setup();
    renderApp();

    // r3 (index 2) is HIGH, which exceeds the default MEDIUM tolerance. It
    // also has a HIGH-band section, so CrowdWarning (AC 1.2.3) legitimately
    // renders its own alert alongside ToleranceWarning here - find the
    // tolerance one specifically.
    await planAndSelectRoute(user, 2);

    const alerts = screen.getAllByRole('alert');
    const warning = alerts.find((el) => /busier than your usual limit/i.test(el.textContent));
    expect(warning).toBeDefined();
    expect(warning).toHaveTextContent(/9 min/);

    const switchButton = screen.getByRole('button', { name: /use this route instead/i });
    expect(switchButton).toBeInTheDocument();

    await user.click(switchButton);

    await waitFor(() =>
      expect(
        screen.queryAllByRole('alert').some((el) => /busier than your usual limit/i.test(el.textContent)),
      ).toBe(false),
    );
  });

  it('shows no tolerance warning when the route is within tolerance', async () => {
    const user = userEvent.setup();
    renderApp();

    // r1 (index 0) is LOW, well within the default MEDIUM tolerance.
    await planAndSelectRoute(user, 0);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
