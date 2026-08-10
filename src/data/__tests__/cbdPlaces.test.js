import { describe, it, expect } from 'vitest';
import { CBD_PLACES, findPlaceByName, searchPlaces, isWithinCbd, CBD_BBOX } from '../cbdPlaces.js';

describe('CBD_PLACES', () => {
  it('has at least the places currently required for the app to work', () => {
    expect(CBD_PLACES.length).toBeGreaterThan(20);
  });

  it('every place has a unique id and name', () => {
    const ids = CBD_PLACES.map((p) => p.id);
    const names = CBD_PLACES.map((p) => p.name.toLowerCase());
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(names).size).toBe(names.length);
  });

  it('every place has valid coordinates', () => {
    CBD_PLACES.forEach((place) => {
      expect(typeof place.lat).toBe('number');
      expect(typeof place.lng).toBe('number');
    });
  });

  it('includes the out-of-coverage places needed for AC 1.1.1 Scenario 3', () => {
    expect(CBD_PLACES.some((p) => p.id === 'st-kilda-beach')).toBe(true);
    expect(CBD_PLACES.some((p) => p.farFromCbd)).toBe(true);
  });
});

describe('isWithinCbd', () => {
  it('accepts a point inside the bounding box', () => {
    expect(isWithinCbd(-37.8136, 144.9631)).toBe(true);
  });

  it('rejects a point outside the bounding box', () => {
    expect(isWithinCbd(-37.8677, 144.9797)).toBe(false);
  });

  it('is consistent with CBD_BBOX', () => {
    expect(isWithinCbd(CBD_BBOX.minLat, CBD_BBOX.minLng)).toBe(true);
    expect(isWithinCbd(CBD_BBOX.minLat - 0.01, CBD_BBOX.minLng)).toBe(false);
  });
});

describe('searchPlaces', () => {
  it('returns nothing for an empty query', () => {
    expect(searchPlaces('')).toEqual([]);
    expect(searchPlaces('   ')).toEqual([]);
  });

  it('tier 1: name-prefix match ranks first', () => {
    const results = searchPlaces('melbourne c');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.toLowerCase().startsWith('melbourne c')).toBe(true);
  });

  it('tier 2: word-prefix match finds a place by its second word', () => {
    const results = searchPlaces('street');
    expect(results.some((p) => /\bstreet/i.test(p.name))).toBe(true);
  });

  it('tier 3: subsequence fuzzy match finds a place from scattered letters', () => {
    const results = searchPlaces('mlbcen');
    expect(results.some((p) => p.name.toLowerCase().includes('melbourne central'))).toBe(true);
  });

  it('respects the limit', () => {
    const results = searchPlaces('a', 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });
});

describe('findPlaceByName', () => {
  it('resolves an exact match', () => {
    expect(findPlaceByName('Bourke Street Mall')?.id).toBe('bourke-street-mall');
  });

  it('resolves a partial match when it narrows to exactly one place', () => {
    expect(findPlaceByName('flinders')?.name).toBe('Flinders Street Station');
  });

  it('returns null for no match', () => {
    expect(findPlaceByName('Nowhere In Particular')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(findPlaceByName('')).toBeNull();
  });
});
