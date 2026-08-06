import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ForecastTimeline from '../ForecastTimeline.jsx';
import { BAND_LABELS } from '../../utils/bandLabels.js';

const timeline = [
  { minutesAhead: 15, predictedCount: 40, band: 'LOW' },
  { minutesAhead: 30, predictedCount: 92, band: 'MEDIUM' },
  { minutesAhead: 45, predictedCount: 164, band: 'HIGH' },
  { minutesAhead: 60, predictedCount: 130, band: 'MEDIUM' },
];

describe('ForecastTimeline band classification (AC 2.2.2)', () => {
  it('labels every predicted point Low, Medium or High using the same bands as the route indicator', () => {
    render(<ForecastTimeline timeline={timeline} liveCount={null} />);

    // Same text labels the route SensoryIndicator uses (src/utils/bandLabels.js),
    // not a forecast-specific vocabulary.
    expect(screen.getByText(BAND_LABELS.LOW.text)).toBeInTheDocument();
    expect(screen.getAllByText(BAND_LABELS.MEDIUM.text)).toHaveLength(2);
    expect(screen.getByText(BAND_LABELS.HIGH.text)).toBeInTheDocument();
  });

  it.each([
    ['LOW', 'circle'],
    ['MEDIUM', 'triangle'],
    ['HIGH', 'square'],
  ])('band %s renders the shared %s icon, not a forecast-only shape', (band, expectedShape) => {
    render(
      <ForecastTimeline
        timeline={[{ minutesAhead: 15, predictedCount: 1, band }]}
        liveCount={null}
      />,
    );

    expect(BAND_LABELS[band].icon).toBe(expectedShape);
    expect(screen.getByText(BAND_LABELS[band].text)).toBeInTheDocument();
  });
});
