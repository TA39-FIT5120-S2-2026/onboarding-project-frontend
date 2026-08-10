import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CrowdWarning from '../CrowdWarning.jsx';

const highSections = [
  {
    sectionId: 1,
    sensoryBand: 'HIGH',
    sensors: [{ locationId: 34, name: 'Swanston St North' }],
  },
  {
    sectionId: 2,
    sensoryBand: 'HIGH',
    sensors: [],
  },
];

const noHighSections = [
  { sectionId: 1, sensoryBand: 'LOW', sensors: [{ locationId: 1, name: 'Elizabeth St' }] },
  { sectionId: 2, sensoryBand: 'LOW', sensors: [{ locationId: 2, name: 'La Trobe St' }] },
];

describe('CrowdWarning (AC 1.2.3)', () => {
  it('Scenario 2: names the affected street section and the data last-updated time', () => {
    render(<CrowdWarning sections={highSections} latestReadingAt="2026-08-07T14:20:00+10:00" />);

    const warning = screen.getByRole('alert');
    expect(warning).toHaveTextContent('Swanston St North');
    expect(warning).toHaveTextContent(/last updated/i);
    expect(warning).toHaveTextContent('2:20 pm');
  });

  it('Scenario 3: shows no crowd warning when the route has no High-band section', () => {
    render(<CrowdWarning sections={noHighSections} latestReadingAt="2026-08-07T14:20:00+10:00" />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
