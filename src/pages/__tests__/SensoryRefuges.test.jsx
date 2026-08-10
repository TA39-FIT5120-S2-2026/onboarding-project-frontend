import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RoutePlanner from '../RoutePlanner.jsx';
import RouteResults from '../RouteResults.jsx';
import SensoryRefuges from '../SensoryRefuges.jsx';
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
          <Route path="/refuges" element={<SensoryRefuges />} />
        </Routes>
      </MemoryRouter>
    </SessionProvider>,
  );
}

describe('SensoryRefuges (AC 2.1.1)', () => {
  it('prompts for a location when no route has been planned yet', () => {
    renderApp('/refuges');

    expect(screen.getByText('Sensory Refuges')).toBeInTheDocument();
    expect(screen.getByLabelText('Location')).toBeInTheDocument();
    expect(screen.queryByTestId('map-container')).not.toBeInTheDocument();
  });

  it('shows refuge markers, a legend distinguishing marker types, within a planned route', async () => {
    const user = userEvent.setup();
    renderApp('/');

    await user.type(screen.getByLabelText('Origin'), 'Melbourne Central');
    await user.type(screen.getByLabelText('Destination'), 'Bourke Street Mall');
    await user.click(screen.getByRole('button', { name: /find route/i }));
    await waitFor(() => expect(screen.getByText('Route Results')).toBeInTheDocument());

    await user.click(screen.getAllByRole('link', { name: 'Refuges' })[0]);

    await waitFor(() => expect(screen.getByTestId('map-container')).toBeInTheDocument());
    expect(screen.getByText(/near bourke street mall/i)).toBeInTheDocument();

    // Legend distinguishes the search-location marker from each refuge type.
    const legend = screen.getByText('Map legend').closest('div');
    expect(within(legend).getByText('Search location')).toBeInTheDocument();
    expect(within(legend).getByText('Park')).toBeInTheDocument();
    expect(within(legend).getByText('Library')).toBeInTheDocument();
    expect(within(legend).getByText('Quiet space')).toBeInTheDocument();

    // One marker for the search location plus one per fixture refuge.
    const markers = screen.getAllByTestId('marker');
    expect(markers).toHaveLength(4);

    // Route information is also available as text outside the map.
    expect(screen.getByText('State Library Victoria')).toBeInTheDocument();
    expect(screen.getByText('Flagstaff Gardens')).toBeInTheDocument();
  });

  it('"Back to search" returns to the location form without leaving the page', async () => {
    const user = userEvent.setup();
    renderApp('/');

    await user.type(screen.getByLabelText('Origin'), 'Melbourne Central');
    await user.type(screen.getByLabelText('Destination'), 'Bourke Street Mall');
    await user.click(screen.getByRole('button', { name: /find route/i }));
    await waitFor(() => expect(screen.getByText('Route Results')).toBeInTheDocument());
    await user.click(screen.getAllByRole('link', { name: 'Refuges' })[0]);
    await waitFor(() => expect(screen.getByText('State Library Victoria')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /back to search/i }));

    expect(screen.getByLabelText('Location')).toBeInTheDocument();
    expect(screen.queryByTestId('map-container')).not.toBeInTheDocument();
  });
});

describe('SensoryRefuges selection (AC 2.1.2)', () => {
  it('shows refuge detail when a refuge is selected, including an Unavailable address', async () => {
    const user = userEvent.setup();
    renderApp('/');

    await user.type(screen.getByLabelText('Origin'), 'Melbourne Central');
    await user.type(screen.getByLabelText('Destination'), 'Bourke Street Mall');
    await user.click(screen.getByRole('button', { name: /find route/i }));
    await waitFor(() => expect(screen.getByText('Route Results')).toBeInTheDocument());
    await user.click(screen.getAllByRole('link', { name: 'Refuges' })[0]);
    await waitFor(() => expect(screen.getByText('State Library Victoria')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /state library victoria/i }));
    expect(screen.getByText('328 Swanston St, Melbourne')).toBeInTheDocument();

    // Flagstaff Gardens has a null address in the fixture.
    await user.click(screen.getByRole('button', { name: /flagstaff gardens/i }));
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });
});

describe('SensoryRefuges filter (AC 2.1.3)', () => {
  async function reachRefugesPage(user) {
    renderApp('/');
    await user.type(screen.getByLabelText('Origin'), 'Melbourne Central');
    await user.type(screen.getByLabelText('Destination'), 'Bourke Street Mall');
    await user.click(screen.getByRole('button', { name: /find route/i }));
    await waitFor(() => expect(screen.getByText('Route Results')).toBeInTheDocument());
    await user.click(screen.getAllByRole('link', { name: 'Refuges' })[0]);
    await waitFor(() => expect(screen.getByText('State Library Victoria')).toBeInTheDocument());
  }

  it('Scenario 1: only refuges of the selected type remain visible', async () => {
    const user = userEvent.setup();
    await reachRefugesPage(user);

    await user.click(screen.getByRole('checkbox', { name: /park/i }));
    await waitFor(() => expect(screen.getByText('Flagstaff Gardens')).toBeInTheDocument());

    expect(screen.getByText('Queen Victoria Gardens')).toBeInTheDocument();
    expect(screen.queryByText('State Library Victoria')).not.toBeInTheDocument();
  });

  it('Scenario 2: shows a message when the selected filter returns no refuges nearby', async () => {
    const user = userEvent.setup();
    await reachRefugesPage(user);

    // The fixture data has no quiet_space refuges near this location.
    await user.click(screen.getByRole('checkbox', { name: /quiet space/i }));

    expect(
      await screen.findByText('No refuges of the selected types were found nearby.'),
    ).toBeInTheDocument();
  });
});
