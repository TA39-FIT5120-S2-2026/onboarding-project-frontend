// Mock backend. Standing in for the real API while VITE_USE_FIXTURES=true.
// Encodes the derived-field rules from API_CONTRACT.md (withinTolerance,
// noRouteMeetsTolerance) the way the real backend would - production code
// in src/api/*.js never recomputes a band or a tolerance comparison itself.

import routesDefault from './routes.json';
import routesPeak from './routesPeak.json';
import routeDetails from './routeDetails.json';
import refuges from './refuges.json';
import forecastDefault from './forecast.json';
import forecastInsufficient from './forecastInsufficient.json';
import { isWithinCbd } from '../../data/cbdPlaces.js';
import { exceedsTolerance } from '../../utils/tolerance.js';

const FLINDERS_STREET_STATION = { lat: -37.8183, lng: 144.9671 };
const DOCKLANDS_LIBRARY = { lat: -37.8154, lng: 144.9505 };
const COORD_EPSILON = 0.001;

function near(a, b, lat, lng) {
  return Math.abs(a - lat) < COORD_EPSILON && Math.abs(b - lng) < COORD_EPSILON;
}

function parseLatLng(value) {
  if (!value) return null;
  const [lat, lng] = value.split(',').map(Number);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}

function outOfBoundsError() {
  return {
    error: {
      code: 'OUT_OF_BOUNDS',
      message: 'That location is outside the Melbourne CBD area we cover.',
    },
  };
}

function missingParameterError(name) {
  return {
    error: {
      code: 'MISSING_PARAMETER',
      message: `The ${name} parameter is required.`,
    },
  };
}

function handleRoutes(query) {
  if (!query.origin || !query.destination) {
    return missingParameterError(!query.origin ? 'origin' : 'destination');
  }

  const origin = parseLatLng(query.origin);
  const destination = parseLatLng(query.destination);

  if (!origin || !destination) {
    return missingParameterError('origin or destination');
  }

  if (!isWithinCbd(origin.lat, origin.lng) || !isWithinCbd(destination.lat, destination.lng)) {
    return outOfBoundsError();
  }

  const toleranceApplied = query.tolerance ?? 'MEDIUM';
  const isPeak = near(
    destination.lat,
    destination.lng,
    FLINDERS_STREET_STATION.lat,
    FLINDERS_STREET_STATION.lng,
  );
  const base = isPeak ? routesPeak : routesDefault;

  const routes = base.routes.map((route) => ({
    ...route,
    withinTolerance: !exceedsTolerance(route.band, toleranceApplied),
  }));
  const noRouteMeetsTolerance = routes.every((route) => !route.withinTolerance);

  return {
    data: {
      routes,
      accessPoints: base.accessPoints,
      toleranceApplied,
      noRouteMeetsTolerance,
    },
  };
}

function handleRouteDetail(id) {
  const detail = routeDetails[id];
  if (!detail) {
    return {
      error: { code: 'NO_ROUTE_FOUND', message: 'That route could not be found.' },
    };
  }
  return { data: detail };
}

function handleRefuges(query) {
  if (!query.lat || !query.lng) {
    return missingParameterError(!query.lat ? 'lat' : 'lng');
  }

  const types = query.types ? query.types.split(',') : null;
  const filtered = types
    ? refuges.refuges.filter((r) => types.includes(r.category))
    : refuges.refuges;

  return {
    data: { refuges: filtered, searchRadiusMetres: refuges.searchRadiusMetres },
  };
}

function handleForecast(query) {
  if (!query.sensorId && !(query.lat && query.lng)) {
    return missingParameterError('sensorId, or lat and lng');
  }

  if (query.lat && query.lng) {
    const lat = Number(query.lat);
    const lng = Number(query.lng);
    if (near(lat, lng, DOCKLANDS_LIBRARY.lat, DOCKLANDS_LIBRARY.lng)) {
      return { data: forecastInsufficient };
    }
  }

  return { data: forecastDefault };
}

export function resolveFixture(path, query) {
  const routeDetailMatch = path.match(/^\/api\/routes\/([^/]+)$/);

  if (path === '/api/routes') return handleRoutes(query);
  if (routeDetailMatch) return handleRouteDetail(routeDetailMatch[1]);
  if (path === '/api/refuges') return handleRefuges(query);
  if (path === '/api/forecast') return handleForecast(query);

  return {
    error: { code: 'INTERNAL_ERROR', message: `No fixture registered for ${path}` },
  };
}
