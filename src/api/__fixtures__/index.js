// Mock backend for POST /api/routes/plan, standing in for
// onboarding-project-backend while VITE_USE_FIXTURES=true. Shape matches
// docs/API_CONTRACT.md (the backend as-built), not the original proposed
// contract - see docs/BACKEND_GAPS.md. Encodes the derived-field rules
// (withinTolerance, recommended, decision, hasAcceptableRoute) the way the
// real toleranceService/routeRankingService would; production code in
// src/api/*.js never computes a band or a tolerance comparison itself.

import { isWithinCbd } from '../../data/cbdPlaces.js';
import { bandRank } from '../../utils/bandLabels.js';

const FLINDERS_STREET_STATION = { lat: -37.8183, lng: 144.9671 };
const COORD_EPSILON = 0.001;

function near(a, b, lat, lng) {
  return Math.abs(a - lat) < COORD_EPSILON && Math.abs(b - lng) < COORD_EPSILON;
}

function makeRoute({ routeId, minutes, meters, band, count, maxCount, sensorName, streetName, coordinates }) {
  const geometry = { type: 'LineString', coordinates };
  const hasSensor = band !== 'NO_DATA';
  const section = {
    sectionId: routeId * 10 + 1,
    sensoryBand: band,
    geometry,
    startCoordinate: coordinates[0],
    endCoordinate: coordinates[coordinates.length - 1],
    distanceMeters: meters,
    averagePedestrianCount: hasSensor ? count : null,
    maximumPedestrianCount: hasSensor ? maxCount : null,
    sensorIds: hasSensor ? [routeId * 10 + 1] : [],
    sensors: hasSensor ? [{ locationId: routeId * 10 + 1, name: streetName }] : [],
    freshnessStatus: hasSensor ? 'FRESH' : 'NONE',
  };

  return {
    routeId,
    distance: { meters, kilometres: Number((meters / 1000).toFixed(2)) },
    duration: { seconds: minutes * 60, minutes },
    exposure: {
      sensoryBand: band,
      dataCoverage: hasSensor ? 'PARTIAL' : 'NONE',
      routeRadiusMeters: 50,
      matchedSensorCount: hasSensor ? 1 : 0,
      averagePedestrianCount: hasSensor ? count : null,
      maximumPedestrianCount: hasSensor ? maxCount : null,
      latestReadingAt: '2026-08-07T14:20:00+10:00',
      dataSource: 'City of Melbourne Open Data',
      freshnessStatus: 'FRESH',
      staleAfterMinutes: 30,
      sensors: hasSensor
        ? [
            {
              locationId: routeId * 10 + 1,
              name: streetName,
              sensorName,
              coordinates: { latitude: coordinates[0][1], longitude: coordinates[0][0] },
              distanceFromRouteMeters: 12,
              pedestrianCount: count,
              sensoryBand: band,
              timestamp: '2026-08-07T14:20:00+10:00',
              readingAgeMinutes: 4,
              freshnessStatus: 'FRESH',
            },
          ]
        : [],
    },
    routeSections: [section],
    congestedSections: bandRank(band) >= bandRank('MEDIUM') ? [section] : [],
    geometry,
    segments: [
      {
        distance: meters,
        duration: minutes * 60,
        steps: [
          {
            distance: meters,
            duration: minutes * 60,
            type: 11,
            instruction: `Head toward ${streetName}`,
            name: streetName,
            way_points: [0, coordinates.length - 1],
          },
        ],
      },
    ],
  };
}

const DEFAULT_ROUTES = [
  makeRoute({
    routeId: 1,
    minutes: 10,
    meters: 700,
    band: 'LOW',
    count: 38,
    maxCount: 50,
    sensorName: 'Elizabeth St North',
    streetName: 'Elizabeth St',
    coordinates: [
      [144.9631, -37.8136],
      [144.9648, -37.8118],
      [144.9671, -37.8109],
    ],
  }),
  makeRoute({
    routeId: 2,
    minutes: 8,
    meters: 500,
    band: 'MEDIUM',
    count: 54,
    maxCount: 70,
    sensorName: 'Bourke St Mid',
    streetName: 'Bourke St',
    coordinates: [
      [144.9631, -37.8136],
      [144.9652, -37.8098],
      [144.9671, -37.8109],
    ],
  }),
  makeRoute({
    routeId: 3,
    minutes: 9,
    meters: 600,
    band: 'HIGH',
    count: 162,
    maxCount: 210,
    sensorName: 'Swanston St North',
    streetName: 'Swanston St',
    coordinates: [
      [144.9631, -37.8136],
      [144.9666, -37.8154],
      [144.9671, -37.8109],
    ],
  }),
];

const PEAK_ROUTES = [
  makeRoute({
    routeId: 1,
    minutes: 11,
    meters: 750,
    band: 'MEDIUM',
    count: 92,
    maxCount: 120,
    sensorName: 'Flinders St East',
    streetName: 'Flinders St',
    coordinates: [
      [144.9631, -37.8136],
      [144.9671, -37.8183],
    ],
  }),
  makeRoute({
    routeId: 2,
    minutes: 9,
    meters: 650,
    band: 'HIGH',
    count: 170,
    maxCount: 220,
    sensorName: 'Swanston St North',
    streetName: 'Swanston St',
    coordinates: [
      [144.9631, -37.8136],
      [144.9666, -37.8154],
      [144.9671, -37.8183],
    ],
  }),
];

// Mirrors routeRankingService (rank by ascending exposure) + toleranceService
// (recommend the top-ranked route when it's within tolerance, otherwise
// fall back to it and flag no acceptable route).
function evaluateTolerance(routes, tolerance) {
  const ranked = [...routes]
    .sort((a, b) => a.exposure.averagePedestrianCount - b.exposure.averagePedestrianCount)
    .map((route, index) => ({ ...route, rank: index + 1 }));

  const topRanked = ranked[0];
  const acceptable = ranked.filter((r) => bandRank(r.exposure.sensoryBand) <= bandRank(tolerance));
  const hasAcceptableRoute = acceptable.length > 0;

  const decision = hasAcceptableRoute
    ? {
        crowdTolerance: tolerance,
        toleranceSource: 'USER',
        suitableRouteFound: true,
        originalTopRankedRouteId: topRanked.routeId,
        recommendedRouteId: topRanked.routeId,
        fallbackRouteId: null,
        alternativeUsed: false,
        warningRequired: false,
        reasonCode: 'ROUTE_WITHIN_TOLERANCE',
        message: 'The lowest-exposure route is within your selected tolerance.',
      }
    : {
        crowdTolerance: tolerance,
        toleranceSource: 'USER',
        suitableRouteFound: false,
        originalTopRankedRouteId: topRanked.routeId,
        recommendedRouteId: null,
        fallbackRouteId: topRanked.routeId,
        alternativeUsed: false,
        warningRequired: true,
        reasonCode: 'NO_ROUTE_WITHIN_TOLERANCE',
        message: 'No route meets your selected tolerance. Showing the lowest-exposure option.',
      };

  const routesWithFlags = ranked.map((route) => ({
    ...route,
    withinTolerance: bandRank(route.exposure.sensoryBand) <= bandRank(tolerance),
    recommended: route.rank === 1,
    fallback: !hasAcceptableRoute && route.rank === 1,
  }));

  return {
    routes: routesWithFlags,
    recommendedRouteId: hasAcceptableRoute ? topRanked.routeId : null,
    fallbackRouteId: hasAcceptableRoute ? null : topRanked.routeId,
    acceptableRouteCount: acceptable.length,
    hasAcceptableRoute,
    decision,
    alternativeComparison: null,
  };
}

function missingParameterError(name) {
  return { error: { status: 400, message: `The ${name} parameter is required.` } };
}

function handlePlanRoute(body) {
  const { origin, destination, crowdTolerance } = body ?? {};

  if (!origin || !destination) {
    return missingParameterError(!origin ? 'origin' : 'destination');
  }

  const originInsideCbd = isWithinCbd(origin.latitude, origin.longitude);
  const destinationInsideCbd = isWithinCbd(destination.latitude, destination.longitude);

  if (!originInsideCbd || !destinationInsideCbd) {
    return {
      error: {
        status: 400,
        message: 'Origin and destination must be within Melbourne CBD.',
        data: { originInsideCbd, destinationInsideCbd, canPlanRoute: false },
      },
    };
  }

  const tolerance = crowdTolerance ?? 'MEDIUM';
  const isPeak = near(
    destination.latitude,
    destination.longitude,
    FLINDERS_STREET_STATION.lat,
    FLINDERS_STREET_STATION.lng,
  );
  const evaluated = evaluateTolerance(isPeak ? PEAK_ROUTES : DEFAULT_ROUTES, tolerance);

  return {
    data: {
      origin,
      destination,
      routeCount: evaluated.routes.length,
      recommendedRouteId: evaluated.recommendedRouteId,
      crowdTolerance: tolerance,
      acceptableRouteCount: evaluated.acceptableRouteCount,
      hasAcceptableRoute: evaluated.hasAcceptableRoute,
      fallbackRouteId: evaluated.fallbackRouteId,
      decision: evaluated.decision,
      alternativeComparison: evaluated.alternativeComparison,
      routes: evaluated.routes,
    },
  };
}

export function resolveFixture(path, body) {
  if (path === '/api/routes/plan') return handlePlanRoute(body);

  return { error: { status: 500, message: `No fixture registered for ${path}` } };
}
