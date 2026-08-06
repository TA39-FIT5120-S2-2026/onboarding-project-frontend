import { describe, it, expect } from 'vitest';
import routes from './routes.json';
import routesPeak from './routesPeak.json';
import routeDetails from './routeDetails.json';
import refuges from './refuges.json';
import forecast from './forecast.json';
import forecastInsufficient from './forecastInsufficient.json';

const ROUTE_FIELDS = [
  'id',
  'walkingTimeMinutes',
  'distanceMetres',
  'averageCountPerMinute',
  'band',
  'recommended',
  'reason',
  'geometry',
];

const SEGMENT_FIELDS = [
  'geometry',
  'streetName',
  'sensorId',
  'sensorName',
  'countPerMinute',
  'band',
  'readingTakenAt',
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

describe('fixtures match API_CONTRACT.md field names', () => {
  it.each([
    ['routes.json', routes],
    ['routesPeak.json', routesPeak],
  ])('%s routes have contract fields', (_name, fixture) => {
    expect(fixture.routes.length).toBeGreaterThan(0);
    fixture.routes.forEach((route) => expectFields(route, ROUTE_FIELDS));
    expect(fixture.routes.filter((r) => r.recommended).length).toBe(1);
    expect(fixture.accessPoints).toHaveProperty('origin');
    expect(fixture.accessPoints).toHaveProperty('destination');
  });

  it('routeDetails segments have contract fields', () => {
    Object.values(routeDetails).forEach((detail) => {
      expect(detail).toHaveProperty('id');
      expect(detail).toHaveProperty('attribution');
      expect(detail).toHaveProperty('dataLastUpdated');
      detail.segments.forEach((segment) => {
        expectFields(segment, SEGMENT_FIELDS);
        expect(VALID_BANDS).toContain(segment.band);
        expect(segment.streetName).toBeTruthy();
        if (segment.band === 'NO_DATA') {
          expect(segment.sensorId).toBeNull();
          expect(segment.sensorName).toBeNull();
          expect(segment.countPerMinute).toBeNull();
          expect(segment.readingTakenAt).toBeNull();
        }
      });
    });
  });

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
