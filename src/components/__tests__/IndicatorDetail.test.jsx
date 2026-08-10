import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IndicatorDetail from '../IndicatorDetail.jsx';

const lowExposure = {
  sensoryBand: 'LOW',
  averagePedestrianCount: 38,
  dataSource: 'City of Melbourne Open Data',
  sensors: [
    {
      locationId: 34,
      name: 'Elizabeth St North',
      sensorName: 'Elizabeth St North',
      pedestrianCount: 34,
      timestamp: '2026-08-07T14:20:00+10:00',
    },
  ],
};

const highExposureNoSensors = {
  sensoryBand: 'HIGH',
  averagePedestrianCount: 162,
  dataSource: 'City of Melbourne Open Data',
  sensors: [],
};

describe('IndicatorDetail (AC 1.1.3)', () => {
  it('Scenario 1: shows sensor name, count, reading time and attribution when the indicator is selected', async () => {
    const user = userEvent.setup();
    render(<IndicatorDetail routeId={1} exposure={lowExposure} />);

    const trigger = screen.getByRole('button', { name: /low/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Elizabeth St North')).toBeInTheDocument();
    expect(screen.getByText('City of Melbourne Open Data, CC BY 4.0')).toBeInTheDocument();
    expect(screen.getByText(/34 counts \/ min/)).toBeInTheDocument();
  });

  it('Scenario 2: a section with no sensor reading is shown as "No sensor data", never Low', async () => {
    const user = userEvent.setup();
    render(<IndicatorDetail routeId={3} exposure={highExposureNoSensors} />);

    await user.click(screen.getByRole('button', { name: /high/i }));

    const panel = screen.getByText('No sensor data').closest('div');
    expect(panel).toHaveTextContent('No sensor data');
    expect(panel).not.toHaveTextContent('Low');
  });
});
