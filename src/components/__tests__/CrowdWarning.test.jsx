import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CrowdWarning from '../CrowdWarning.jsx';

const highSegments = [
  {
    streetName: 'Swanston St',
    band: 'HIGH',
    countPerMinute: 187,
    sensorId: 34,
    sensorName: 'Swanston St North',
  },
  {
    streetName: 'Little Lonsdale St',
    band: 'NO_DATA',
    countPerMinute: null,
    sensorId: null,
    sensorName: null,
  },
];

const noHighSegments = [
  { streetName: 'Elizabeth St', band: 'LOW', countPerMinute: 34 },
  { streetName: 'La Trobe St', band: 'LOW', countPerMinute: 41 },
];

describe('CrowdWarning (AC 1.2.3)', () => {
  it('Scenario 2: names the affected street section and the data last-updated time', () => {
    render(<CrowdWarning segments={highSegments} dataLastUpdated="2026-08-07T14:20:00+10:00" />);

    const warning = screen.getByRole('alert');
    expect(warning).toHaveTextContent('Swanston St');
    expect(warning).toHaveTextContent(/last updated/i);
    expect(warning).toHaveTextContent('2:20 pm');
  });

  it('Scenario 3: shows no crowd warning when the route has no High-band section', () => {
    render(<CrowdWarning segments={noHighSegments} dataLastUpdated="2026-08-07T14:20:00+10:00" />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
