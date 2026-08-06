import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SensoryIndicator from '../SensoryIndicator.jsx';

// The API classifies bands, never the frontend. These tests confirm the
// component is a pure function of the `band` string it is given - the
// count is display-only and never flips the label, even right at the
// contract boundaries (49/50 and 149/150).
describe('SensoryIndicator (AC 1.1.2)', () => {
  it.each([
    ['LOW', 49, 'Low'],
    ['MEDIUM', 50, 'Medium'],
    ['MEDIUM', 149, 'Medium'],
    ['HIGH', 150, 'High'],
  ])('renders band %s at boundary count %i as "%s", with text and icon', (band, count, label) => {
    render(<SensoryIndicator band={band} countPerMinute={count} />);
    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByText(`${count} counts / min`)).toBeInTheDocument();
  });

  it('renders NO_DATA as "No sensor data", never as Low', () => {
    render(<SensoryIndicator band="NO_DATA" countPerMinute={null} />);
    expect(screen.getByText('No sensor data')).toBeInTheDocument();
    expect(screen.queryByText('Low')).not.toBeInTheDocument();
  });

  it('does not show a count when countPerMinute is null', () => {
    render(<SensoryIndicator band="NO_DATA" countPerMinute={null} />);
    expect(screen.queryByText(/counts \/ min/)).not.toBeInTheDocument();
  });
});
