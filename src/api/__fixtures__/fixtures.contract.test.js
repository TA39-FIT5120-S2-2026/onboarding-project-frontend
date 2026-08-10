import { describe, it, expect } from 'vitest';
import { resolveFixture } from './index.js';
import refuges from './refuges.json';
import forecast from './forecast.json';
import forecastInsufficient from './forecastInsufficient.json';

const MELBOURNE_CENTRAL = { latitude: -37.8103, longitude: 144.9628 };
const BOURKE_STREET_MALL = { latitude: -37.8136, longitude: 144.9648 };
const FLINDERS_STREET_STATION = { latitude: -37.8183, longitude: 144.9671 };
const ST_KILDA_BEACH = { latitude: -37.8677, longitude: 144.9797 };

const PLAN_DATA_FIELDS = [
  'origin',
  'destination',
  'routeCount',
  'recommendedRouteId',
  'crowdTolerance',
  'acceptableRouteCount',
  'hasAcceptableRoute',
  'fallbackRouteId',
  'decision',
  'alternativeComparison',
  'routes',
];

const ROUTE_FIELDS = [
  'routeId',
  'rank',
  'distance',
  'duration',
  'exposure',
  'routeSections',
  'congestedSections',
  'geometry',
  'segments',
  'withinTolerance',
  'recommended',
  'fallback',
];

const EXPOSURE_FIELDS = [
  'sensoryBand',
  'dataCoverage',
  'routeRadiusMeters',
  'matchedSensorCount',
  'averagePedestrianCount',
  'maximumPedestrianCount',
  'latestReadingAt',
  'dataSource',
  'freshnessStatus',
  'staleAfterMinutes',
  'sensors',
];

const SECTION_FIELDS = [
  'sectionId',
  'sensoryBand',
  'geometry',
  'startCoordinate',
  'endCoordinate',
  'distanceMeters',
  'averagePedestrianCount',
  'maximumPedestrianCount',
  'sensorIds',
  'sensors',
  'freshnessStatus',
];

const REFUGE_FIELDS = ['id', 'name', 'category', 'address', 'walkingDistanceMetres', 'lat', 'lng'];

const FORECAST_FIELDS = [
  'sensorId',
  'sensorName',
  'generatedAt',
  'windowMinutes',
  'basis',
  'sufficientHistory',
  'timeline',
  'peakBand',
  'peakWindow',
];

const TIMELINE_POINT_FIELDS = ['minutesAhead', 'predictedCount', 'band'];

const VALID_BANDS = ['LOW', 'MEDIUM', 'HIGH', 'NO_DATA'];

function expectFields(obj, fields) {
  fields.forEach((field) => expect(obj).toHaveProperty(field));
  Object.keys(obj).forEach((key) => expect(fields).toContain(key));
}

function planRoute(origin, destination, crowdTolerance) {
  const result = resolveFixture('/api/routes/plan', { origin, destination, crowdTolerance });
  expect(result.error).toBeUndefined();
  return result.data;
}

describe('route-plan fixture matches API_CONTRACT.md field names', () => {
  it('a normal plan has contract fields at every level', () => {
    const data = planRoute(MELBOURNE_CENTRAL, BOURKE_STREET_MALL, 'MEDIUM');
    expectFields(data, PLAN_DATA_FIELDS);
    expect(data.routes.length).toBeGreaterThan(0);

    data.routes.forEach((route) => {
      expectFields(route, ROUTE_FIELDS);
      expectFields(route.exposure, EXPOSURE_FIELDS);
      expect(VALID_BANDS).toContain(route.exposure.sensoryBand);
      route.routeSections.forEach((section) => expectFields(section, SECTION_FIELDS));
    });

    expect(data.routes.filter((r) => r.recommended).length).toBe(1);
    expect(data.hasAcceptableRoute).toBe(true);
  });

  it('an out-of-CBD destination returns canPlanRoute: false, never a route list', () => {
    const result = resolveFixture('/api/routes/plan', {
      origin: MELBOURNE_CENTRAL,
      destination: ST_KILDA_BEACH,
      crowdTolerance: 'MEDIUM',
    });
    expect(result.error).toBeDefined();
    expect(result.error.status).toBe(400);
    expect(result.error.data.canPlanRoute).toBe(false);
  });

  it('a strict tolerance at a peak destination yields hasAcceptableRoute: false with every route not within tolerance', () => {
    const data = planRoute(MELBOURNE_CENTRAL, FLINDERS_STREET_STATION, 'LOW');
    expect(data.hasAcceptableRoute).toBe(false);
    expect(data.fallbackRouteId).not.toBeNull();
    data.routes.forEach((route) => expect(route.withinTolerance).toBe(false));
  });

  it('NO_DATA is never returned as LOW', () => {
    const data = planRoute(MELBOURNE_CENTRAL, BOURKE_STREET_MALL, 'MEDIUM');
    data.routes.forEach((route) => {
      if (route.exposure.sensoryBand === 'NO_DATA') {
        expect(route.exposure.averagePedestrianCount).toBeNull();
      }
    });
  });
});

describe('sample-data fixtures match API_CONTRACT.md field names', () => {
  it('refuges.json has contract fields', () => {
    refuges.refuges.forEach((refuge) => expectFields(refuge, REFUGE_FIELDS));
    expect(refuges).toHaveProperty('searchRadiusMetres');
    refuges.refuges.forEach((r) =>
      expect(['park', 'library', 'quiet_space']).toContain(r.category),
    );
  });

  it.each([
    ['forecast.json', forecast],
    ['forecastInsufficient.json', forecastInsufficient],
  ])('%s has contract fields', (_name, fixture) => {
    expectFields(fixture, FORECAST_FIELDS);
    expect(fixture.basis).toBe('historical');
    fixture.timeline.forEach((point) => expectFields(point, TIMELINE_POINT_FIELDS));
  });

  it('forecastInsufficient.json follows the sufficientHistory: false rules', () => {
    expect(forecastInsufficient.sufficientHistory).toBe(false);
    expect(forecastInsufficient.timeline).toEqual([]);
    expect(forecastInsufficient.peakBand).toBeNull();
    expect(forecastInsufficient.peakWindow).toBeNull();
  });
});
