// No backend implements GET /api/forecast (see docs/BACKEND_GAPS.md). This
// always serves bundled sample data - never a network call - so the
// Forecast page stays usable.
import forecastDefault from './__fixtures__/forecast.json';
import forecastInsufficient from './__fixtures__/forecastInsufficient.json';

const DOCKLANDS_LIBRARY = { lat: -37.8154, lng: 144.9505 };
const COORD_EPSILON = 0.001;
const FIXTURE_DELAY_MS = 250;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function near(lat, lng) {
  return (
    Math.abs(lat - DOCKLANDS_LIBRARY.lat) < COORD_EPSILON &&
    Math.abs(lng - DOCKLANDS_LIBRARY.lng) < COORD_EPSILON
  );
}

export async function getForecast({ lat, lng } = {}) {
  await delay(FIXTURE_DELAY_MS);

  if (lat != null && lng != null && near(lat, lng)) {
    return forecastInsufficient;
  }
  return forecastDefault;
}
