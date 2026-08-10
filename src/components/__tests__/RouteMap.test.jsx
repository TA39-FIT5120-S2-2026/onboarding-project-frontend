import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RouteMap from '../RouteMap.jsx';
import MapLegend from '../MapLegend.jsx';
import { BAND_COLORS } from '../../utils/bandLabels.js';

// react-leaflet is mocked globally in src/test/setup.jsx - jsdom cannot run
// Leaflet's real SVG renderer. The mock still passes pathOptions through,
// so this test can verify each band actually gets a distinct style.
const sections = [
  {
    sectionId: 1,
    sensoryBand: 'HIGH',
    geometry: {
      type: 'LineString',
      coordinates: [
        [144.9631, -37.8136],
        [144.9666, -37.8154],
      ],
    },
  },
  {
    sectionId: 2,
    sensoryBand: 'LOW',
    geometry: {
      type: 'LineString',
      coordinates: [
        [144.9666, -37.8154],
        [144.9671, -37.8109],
      ],
    },
  },
];

describe('RouteMap (AC 1.2.3 Scenario 1)', () => {
  it('draws the High section with a different colour and line pattern than the rest of the route', () => {
    render(<RouteMap sections={sections} />);

    const lines = screen.getAllByRole('img', { name: /route line/i });
    expect(lines).toHaveLength(2);

    const high = lines.find((line) => line.dataset.color === BAND_COLORS.HIGH);
    const low = lines.find((line) => line.dataset.color === BAND_COLORS.LOW);

    expect(high).toBeDefined();
    expect(low).toBeDefined();
    expect(high.dataset.dash).not.toBe('solid');
    expect(low.dataset.dash).toBe('solid');
    expect(high.dataset.color).not.toBe(low.dataset.color);
  });

  it('draws no start/end markers when origin and destination are not provided', () => {
    render(<RouteMap sections={sections} />);
    expect(screen.queryAllByTestId('marker')).toHaveLength(0);
  });

  it('draws a start and an end marker when origin and destination are provided', () => {
    render(
      <RouteMap
        sections={sections}
        origin={{ lat: -37.8136, lng: 144.9631, name: 'Melbourne Central' }}
        destination={{ lat: -37.8109, lng: 144.9671, name: 'Bourke Street Mall' }}
      />,
    );
    expect(screen.getAllByTestId('marker')).toHaveLength(2);
  });
});

describe('MapLegend (AC 1.2.3 Scenario 1)', () => {
  it('explains the Low/High distinction in words', () => {
    render(
      <MapLegend
        items={[
          { label: 'Low', lineStyle: { color: BAND_COLORS.LOW } },
          {
            label: 'High (busier than usual)',
            lineStyle: { color: BAND_COLORS.HIGH, pattern: 'dotted' },
          },
        ]}
      />,
    );

    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('High (busier than usual)')).toBeInTheDocument();
  });
});
