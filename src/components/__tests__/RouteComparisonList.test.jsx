import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import RouteComparisonList from '../RouteComparisonList.jsx';

const routes = [
  {
    routeId: 1,
    duration: { seconds: 600, minutes: 10 },
    distance: { meters: 700, kilometres: 0.7 },
    exposure: { sensoryBand: 'LOW', averagePedestrianCount: 38, sensors: [] },
    recommended: true,
  },
  {
    routeId: 2,
    duration: { seconds: 480, minutes: 8 },
    distance: { meters: 500, kilometres: 0.5 },
    exposure: { sensoryBand: 'MEDIUM', averagePedestrianCount: 54, sensors: [] },
    recommended: false,
  },
];

const decision = { message: 'Lowest pedestrian exposure of the available routes' };

describe('RouteComparisonList (AC 1.2.1)', () => {
  it('shows time, pedestrian count and band together per route so the trade-off is visible', () => {
    render(<RouteComparisonList routes={routes} decision={decision} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);

    expect(within(items[0]).getByText(/10 min/)).toBeInTheDocument();
    expect(within(items[0]).getByText('Low')).toBeInTheDocument();
    expect(within(items[0]).getByText('38 counts / min')).toBeInTheDocument();

    expect(within(items[1]).getByText(/8 min/)).toBeInTheDocument();
    expect(within(items[1]).getByText('Medium')).toBeInTheDocument();
    expect(within(items[1]).getByText('54 counts / min')).toBeInTheDocument();
  });

  it('AC 1.2.2: marks the lowest-exposure route Recommended, first, with a plain-language reason', () => {
    render(<RouteComparisonList routes={routes} decision={decision} />);

    const items = screen.getAllByRole('listitem');
    expect(within(items[0]).getByText('Recommended')).toBeInTheDocument();
    expect(
      within(items[0]).getByText('Lowest pedestrian exposure of the available routes'),
    ).toBeInTheDocument();
    expect(within(items[1]).queryByText('Recommended')).not.toBeInTheDocument();
  });
});
