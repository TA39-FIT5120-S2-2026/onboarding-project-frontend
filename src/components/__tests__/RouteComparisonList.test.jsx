import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import RouteComparisonList from '../RouteComparisonList.jsx';

const routes = [
  {
    id: 'r1',
    walkingTimeMinutes: 10,
    distanceMetres: 700,
    averageCountPerMinute: 38,
    band: 'LOW',
    recommended: true,
    reason: 'Lowest pedestrian exposure of the available routes',
  },
  {
    id: 'r2',
    walkingTimeMinutes: 8,
    distanceMetres: 500,
    averageCountPerMinute: 54,
    band: 'MEDIUM',
    recommended: false,
    reason: 'Slightly shorter, moderate pedestrian exposure',
  },
];

describe('RouteComparisonList (AC 1.2.1)', () => {
  it('shows time, pedestrian count and band together per route so the trade-off is visible', () => {
    render(<RouteComparisonList routes={routes} />);

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
    render(<RouteComparisonList routes={routes} />);

    const items = screen.getAllByRole('listitem');
    expect(within(items[0]).getByText('Recommended')).toBeInTheDocument();
    expect(
      within(items[0]).getByText('Lowest pedestrian exposure of the available routes'),
    ).toBeInTheDocument();
    expect(within(items[1]).queryByText('Recommended')).not.toBeInTheDocument();
  });
});
