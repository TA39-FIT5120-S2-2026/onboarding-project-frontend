import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// jsdom does not implement enough of SVG/Canvas for Leaflet's real renderer
// to run (it throws deep inside Leaflet's internals on mount/unmount).
// Mocked globally so any page that reaches RouteMap or RefugeMap - even
// indirectly, via an async fetch resolving after the assertions a test
// cares about - never trips this jsdom limitation.
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  Polyline: ({ pathOptions }) => (
    <div
      role="img"
      aria-label={`route line ${pathOptions.color}`}
      data-color={pathOptions.color}
      data-dash={pathOptions.dashArray ?? 'solid'}
    />
  ),
  Marker: ({ children, eventHandlers }) => (
    <button type="button" data-testid="marker" onClick={() => eventHandlers?.click?.()}>
      {children}
    </button>
  ),
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  useMap: () => ({ fitBounds: vi.fn(), setView: vi.fn() }),
}));
