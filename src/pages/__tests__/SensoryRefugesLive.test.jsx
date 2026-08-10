import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../../context/SessionContext.jsx';

import SensoryRefuges from '../SensoryRefuges.jsx';

function renderPage(refugeLoader) {
  return render(
    <SessionProvider>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SensoryRefuges refugeLoader={refugeLoader} />
      </MemoryRouter>
    </SessionProvider>,
  );
}

async function chooseLocation(user) {
  await user.type(screen.getByLabelText('Location'), 'Melbourne Central');
  await user.click(screen.getByRole('button', { name: /find refuges/i }));
}

describe('SensoryRefuges live states', () => {
  it('shows loading while the backend request is pending', async () => {
    const refugeLoader =
      () => new Promise((resolve) => {
        setTimeout(() => resolve({ refuges: [], searchRadiusMetres: 500 }), 100);
      });
    const user = userEvent.setup();
    renderPage(refugeLoader);
    await chooseLocation(user);
    expect(await screen.findByRole('status')).toHaveTextContent('Finding nearby refuges');
  });

  it('shows an empty state for a successful empty response', async () => {
    const refugeLoader = async () => ({ refuges: [], searchRadiusMetres: 500 });
    const user = userEvent.setup();
    renderPage(refugeLoader);
    await chooseLocation(user);
    expect(
      await screen.findByText('No refuges of the selected types were found nearby.'),
    ).toBeInTheDocument();
  });

  it('shows an API error without substituting fixture refuges', async () => {
    const refugeLoader = async () => {
      throw new Error('Refuge service unavailable.');
    };
    const user = userEvent.setup();
    renderPage(refugeLoader);
    await chooseLocation(user);
    expect(await screen.findByRole('alert')).toHaveTextContent('Refuge service unavailable.');
    expect(screen.queryByTestId('map-container')).not.toBeInTheDocument();
  });
});
