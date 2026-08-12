// Mock backend for POST /api/routes/plan, standing in for
// onboarding-project-backend while VITE_USE_FIXTURES=true. Shape matches
// docs/API_CONTRACT.md (the backend as-built), not the original proposed
// contract - see docs/BACKEND_GAPS.md. Encodes the derived-field rules
// (withinTolerance, recommended, decision, hasAcceptableRoute) the way the
// real toleranceService/routeRankingService would; production code in
// src/api/*.js never computes a band or a tolerance comparison itself.

import { CBD_PLACES, isWithinCbd } from '../../data/cbdPlaces.js';
import { bandRank } from '../../utils/bandLabels.js';
import refugesFixture from './refuges.json';
import forecastDefault from './forecast.json';
import forecastInsufficient from './forecastInsufficient.json';

const FLINDERS_STREET_STATION = { lat: -37.8183, lng: 144.9671 };
const COORD_EPSILON = 0.001;

function near(a, b, lat, lng) {
  return Math.abs(a - lat) < COORD_EPSILON && Math.abs(b - lng) < COORD_EPSILON;
}

function isSupportedRouteCoordinate(latitude, longitude) {
  const knownPlace = CBD_PLACES.find((place) =>
    near(latitude, longitude, place.lat, place.lng),
  );

  if (knownPlace?.supportedAccessPoint) return true;
  if (knownPlace?.nearCbd || knownPlace?.farFromCbd) return false;
  return isWithinCbd(latitude, longitude);
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
    freshnessStatus: hasSensor ? 'CURRENT' : 'NO_DATA',
  };

  return {
    routeId,
    distance: { meters, kilometres: Number((meters / 1000).toFixed(2)) },
    duration: { seconds: minutes * 60, minutes },
    exposure: {
      sensoryBand: band,
      dataCoverage: hasSensor ? 'SENSOR_DATA_AVAILABLE' : 'NO_SENSOR_COVERAGE',
      routeRadiusMeters: 50,
      matchedSensorCount: hasSensor ? 1 : 0,
      averagePedestrianCount: hasSensor ? count : null,
      maximumPedestrianCount: hasSensor ? maxCount : null,
      latestReadingAt: '2026-08-07T14:20:00+10:00',
      dataSource: 'City of Melbourne Open Data',
      freshnessStatus: hasSensor ? 'CURRENT' : 'NO_DATA',
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
              freshnessStatus: 'CURRENT',
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
function evaluateTolerance(routes, tolerance, toleranceSource) {
  const ranked = [...routes]
    .sort((a, b) => {
      const bandDifference = bandRank(a.exposure.sensoryBand) - bandRank(b.exposure.sensoryBand);
      if (bandDifference !== 0) return bandDifference;

      const peakDifference =
        (a.exposure.maximumPedestrianCount ?? Number.MAX_SAFE_INTEGER) -
        (b.exposure.maximumPedestrianCount ?? Number.MAX_SAFE_INTEGER);
      if (peakDifference !== 0) return peakDifference;

      const averageDifference =
        (a.exposure.averagePedestrianCount ?? Number.MAX_SAFE_INTEGER) -
        (b.exposure.averagePedestrianCount ?? Number.MAX_SAFE_INTEGER);
      if (averageDifference !== 0) return averageDifference;

      const durationDifference = a.duration.seconds - b.duration.seconds;
      if (durationDifference !== 0) return durationDifference;
      return a.distance.meters - b.distance.meters;
    })
    .map((route, index) => ({ ...route, rank: index + 1 }));

  const topRanked = ranked[0];
  const acceptable = ranked.filter((r) => bandRank(r.exposure.sensoryBand) <= bandRank(tolerance));
  const hasAcceptableRoute = acceptable.length > 0;

  const recommended = acceptable[0] ?? null;
  const fallback = hasAcceptableRoute ? null : topRanked;
  const alternativeUsed = recommended != null && recommended.routeId !== topRanked.routeId;

  const decision = hasAcceptableRoute
    ? {
        crowdTolerance: tolerance,
        toleranceSource,
        suitableRouteFound: true,
        originalTopRankedRouteId: topRanked.routeId,
        recommendedRouteId: recommended.routeId,
        fallbackRouteId: null,
        alternativeUsed,
        warningRequired: alternativeUsed,
        reasonCode: alternativeUsed ? 'QUIETER_ALTERNATIVE_FOUND' : 'ROUTE_WITHIN_TOLERANCE',
        message: alternativeUsed
          ? 'The highest-ranked route exceeds your selected crowd tolerance. A lower-exposure route has been recommended.'
          : 'The recommended route is within your selected crowd tolerance.',
      }
    : {
        crowdTolerance: tolerance,
        toleranceSource,
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
    recommended: recommended != null && route.routeId === recommended.routeId,
    fallback: fallback != null && route.routeId === fallback.routeId,
  }));

  const alternativeComparison = alternativeUsed
    ? {
        originalRouteId: topRanked.routeId,
        alternativeRouteId: recommended.routeId,
        originalSensoryBand: topRanked.exposure.sensoryBand,
        alternativeSensoryBand: recommended.exposure.sensoryBand,
        additionalDistanceMeters: recommended.distance.meters - topRanked.distance.meters,
        additionalDurationMinutes:
          (recommended.duration.seconds - topRanked.duration.seconds) / 60,
      }
    : null;

  return {
    routes: routesWithFlags,
    recommendedRouteId: recommended?.routeId ?? null,
    fallbackRouteId: hasAcceptableRoute ? null : topRanked.routeId,
    acceptableRouteCount: acceptable.length,
    hasAcceptableRoute,
    decision,
    alternativeComparison,
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

  const originInsideCbd = isSupportedRouteCoordinate(origin.latitude, origin.longitude);
  const destinationInsideCbd = isSupportedRouteCoordinate(
    destination.latitude,
    destination.longitude,
  );

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
  const toleranceSource = crowdTolerance == null ? 'DEFAULT' : 'USER';
  const isPeak = near(
    destination.latitude,
    destination.longitude,
    FLINDERS_STREET_STATION.lat,
    FLINDERS_STREET_STATION.lng,
  );
  const evaluated = evaluateTolerance(
    isPeak ? PEAK_ROUTES : DEFAULT_ROUTES,
    tolerance,
    toleranceSource,
  );

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
      ...(evaluated.alternativeComparison
        ? { alternativeComparison: evaluated.alternativeComparison }
        : {}),
      routes: evaluated.routes,
    },
  };
}

function handleRefreshRoutes(body) {
  const { routes, crowdTolerance } = body ?? {};

  if (!Array.isArray(routes) || routes.length === 0) {
    return { error: { status: 400, message: 'Routes must be provided as a non-empty array.' } };
  }

  const tolerance = crowdTolerance ?? 'MEDIUM';
  const evaluated = evaluateTolerance(
    routes,
    tolerance,
    crowdTolerance == null ? 'DEFAULT' : 'USER',
  );

  return {
    data: {
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

function handleRefuges(url) {
  const types = (url.searchParams.get('types') ?? '').split(',').filter(Boolean);
  const filtered = types.length
    ? refugesFixture.refuges.filter((refuge) => types.includes(refuge.category))
    : refugesFixture.refuges;

  return {
    data: {
      refuges: filtered,
      searchRadiusMetres: refugesFixture.searchRadiusMetres,
    },
  };
}

function handleForecast(url) {
  const lat = Number(url.searchParams.get('lat'));
  const lng = Number(url.searchParams.get('lng'));
  const isDocklands =
    Math.abs(lat - -37.8154) < COORD_EPSILON &&
    Math.abs(lng - 144.9505) < COORD_EPSILON;
  const isChinatown =
    Math.abs(lat - -37.8118) < COORD_EPSILON &&
    Math.abs(lng - 144.9698) < COORD_EPSILON;

  return {
    data: isDocklands || isChinatown ? forecastInsufficient : forecastDefault,
  };
}

export function resolveFixture(path, body) {
  const url = new URL(path, 'http://fixture.local');

  if (url.pathname === '/api/routes/plan') return handlePlanRoute(body);
  if (url.pathname === '/api/routes/refresh') return handleRefreshRoutes(body);
  if (url.pathname === '/api/refuges') return handleRefuges(url);
  if (url.pathname === '/api/forecast') return handleForecast(url);

  return { error: { status: 500, message: `No fixture registered for ${path}` } };
}
