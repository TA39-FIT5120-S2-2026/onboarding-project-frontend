import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IndicatorDetail from '../IndicatorDetail.jsx';

describe('IndicatorDetail (AC 1.1.3)', () => {
  it('Scenario 1: shows sensor name, count, reading time and attribution when the indicator is selected', async () => {
    const user = userEvent.setup();
    render(<IndicatorDetail routeId="r1" band="LOW" countPerMinute={38} />);

    const trigger = screen.getByRole('button', { name: /low/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByText(/Elizabeth St North/)).toBeInTheDocument();
    expect(screen.getByText('City of Melbourne, CC BY 4.0')).toBeInTheDocument();
    expect(screen.getByText(/34 counts \/ min/)).toBeInTheDocument();
  });

  it('Scenario 2: a section with no sensor reading is shown as "No sensor data", never Low', async () => {
    const user = userEvent.setup();
    render(<IndicatorDetail routeId="r3" band="HIGH" countPerMinute={162} />);

    await user.click(screen.getByRole('button', { name: /high/i }));

    expect(await screen.findByText('Little Lonsdale St')).toBeInTheDocument();
    const section = screen.getByText('Little Lonsdale St').closest('li');
    expect(section).toHaveTextContent('No sensor data');
    expect(section).not.toHaveTextContent('Low');
  });
});
