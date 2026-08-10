import { expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SessionProvider } from '../../context/SessionContext.jsx';

vi.mock('../../api/forecast.js', () => ({
  getForecast: vi.fn().mockRejectedValue(new Error('Forecast unavailable.')),
}));

import RoutePlanner from '../RoutePlanner.jsx';
import RouteResults from '../RouteResults.jsx';

it('forecast failure does not break route planning', async () => {
  const user = userEvent.setup();
  render(
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

  await user.type(screen.getByLabelText('Origin'), 'Melbourne Central');
  await user.type(screen.getByLabelText('Destination'), 'Bourke Street Mall');
  await user.click(screen.getByRole('button', { name: /find route/i }));

  await waitFor(() => expect(screen.getByText('Route Results')).toBeInTheDocument());
});
