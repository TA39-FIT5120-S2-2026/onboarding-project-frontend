import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../../context/SessionContext.jsx';

import Forecast from '../Forecast.jsx';

function renderPage(forecastLoader) {
  return render(
    <SessionProvider>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Forecast forecastLoader={forecastLoader} />
      </MemoryRouter>
    </SessionProvider>,
  );
}

async function chooseLocation(user) {
  await user.type(screen.getByLabelText('Area or sensor location'), 'Melbourne Central');
  await user.click(screen.getByRole('button', { name: /show forecast/i }));
}

describe('Forecast live states', () => {
  it('shows loading while the backend request is pending', async () => {
    const forecastLoader =
      () => new Promise((resolve) => {
        setTimeout(() => resolve({ sufficientHistory: false }), 100);
      });
    const user = userEvent.setup();
    renderPage(forecastLoader);
    await chooseLocation(user);
    expect(await screen.findByRole('status')).toHaveTextContent('Loading forecast');
  });

  it('shows an API error without substituting fixture predictions', async () => {
    const forecastLoader = async () => {
      throw new Error('Forecast service unavailable.');
    };
    const user = userEvent.setup();
    renderPage(forecastLoader);
    await chooseLocation(user);
    expect(await screen.findByRole('alert')).toHaveTextContent('Forecast service unavailable.');
    expect(screen.queryByText('In 15 minutes (est.)')).not.toBeInTheDocument();
  });
});
