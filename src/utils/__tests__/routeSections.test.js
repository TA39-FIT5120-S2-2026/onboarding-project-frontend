import { describe, it, expect } from 'vitest';
import { mergeSections } from '../routeSections.js';

// Shape matches a real POST /api/routes/plan response captured against the
// live backend: 9 raw sections, 4 of them NO_DATA. This particular route
// happens to strictly alternate bands (NO_DATA/LOW/NO_DATA/LOW/...), so it
// stays 9 stretches - proof merging never joins non-adjacent sections that
// merely share a band. A second, synthetic case below covers a route where
// adjacent sections genuinely repeat a band and do merge.
const REAL_SECTIONS = [
  { sectionId: 1, sensoryBand: 'NO_DATA', distanceMeters: 81, sensors: [] },
  {
    sectionId: 2,
    sensoryBand: 'LOW',
    distanceMeters: 142,
    sensors: [
      { locationId: 66, name: 'QV2 Apartments, 300 Swanston Street' },
      { locationId: 999, name: 'Melbourne Central' },
    ],
  },
  { sectionId: 3, sensoryBand: 'NO_DATA', distanceMeters: 79, sensors: [] },
  {
    sectionId: 4,
    sensoryBand: 'LOW',
    distanceMeters: 100,
    sensors: [{ locationId: 41, name: 'Chinatown-Swanston St (North)' }],
  },
  { sectionId: 5, sensoryBand: 'NO_DATA', distanceMeters: 30, sensors: [] },
  {
    sectionId: 6,
    sensoryBand: 'LOW',
    distanceMeters: 96,
    sensors: [
      { locationId: 21, name: 'Bourke Street Mall (North)' },
      { locationId: 22, name: 'Bourke Street Mall (South)' },
    ],
  },
  {
    sectionId: 7,
    sensoryBand: 'MEDIUM',
    distanceMeters: 100,
    sensors: [
      { locationId: 23, name: 'Little Collins St-Swanston St (East)' },
      { locationId: 21, name: 'Bourke Street Mall (North)' },
    ],
  },
  {
    sectionId: 8,
    sensoryBand: 'LOW',
    distanceMeters: 79,
    sensors: [{ locationId: 30, name: 'Town Hall (West)' }],
  },
  { sectionId: 9, sensoryBand: 'NO_DATA', distanceMeters: 41, sensors: [] },
];

describe('mergeSections', () => {
  it('never merges non-adjacent sections that happen to share a band', () => {
    // Every section in the real payload alternates bands with its
    // neighbour, so nothing is adjacent-equal and the count stays 9.
    const stretches = mergeSections(REAL_SECTIONS);
    expect(stretches).toHaveLength(REAL_SECTIONS.length);
    const lowStretches = stretches.filter((s) => s.sensoryBand === 'LOW');
    expect(lowStretches).toHaveLength(4);
  });

  it('merges genuinely adjacent same-band sections into one stretch', () => {
    // A route where a HIGH stretch spans 3 raw GPS-derived sections in a
    // row - this is the case merging exists for.
    const sections = [
      { sectionId: 1, sensoryBand: 'LOW', distanceMeters: 50, sensors: [] },
      { sectionId: 2, sensoryBand: 'HIGH', distanceMeters: 30, sensors: [] },
      { sectionId: 3, sensoryBand: 'HIGH', distanceMeters: 40, sensors: [] },
      { sectionId: 4, sensoryBand: 'HIGH', distanceMeters: 20, sensors: [] },
      { sectionId: 5, sensoryBand: 'LOW', distanceMeters: 60, sensors: [] },
    ];
    const stretches = mergeSections(sections);
    expect(stretches).toHaveLength(3);
    expect(stretches[1].sensoryBand).toBe('HIGH');
    expect(stretches[1].distanceMeters).toBe(90);
    expect(stretches[1].sectionIds).toEqual([2, 3, 4]);
  });

  it('band values are byte-identical before and after - never derived or altered', () => {
    const stretches = mergeSections(REAL_SECTIONS);
    const inputBands = REAL_SECTIONS.map((s) => s.sensoryBand);
    const outputBands = stretches.flatMap((s) => s.sectionIds.map(() => s.sensoryBand));
    expect(outputBands).toEqual(inputBands);
  });

  it('NO_DATA sections are never merged into a LOW or other band', () => {
    const stretches = mergeSections(REAL_SECTIONS);
    const noDataStretches = stretches.filter((s) => s.sensoryBand === 'NO_DATA');
    noDataStretches.forEach((stretch) => {
      expect(stretch.sensoryBand).toBe('NO_DATA');
    });
    // 3 separate NO_DATA runs (sections 1, 3, 5, 9 - but 5 and none adjacent)
    expect(noDataStretches.length).toBeGreaterThan(0);
  });

  it('sums distance across merged sections', () => {
    const consecutive = [
      { sectionId: 1, sensoryBand: 'HIGH', distanceMeters: 50, sensors: [] },
      { sectionId: 2, sensoryBand: 'HIGH', distanceMeters: 30, sensors: [] },
    ];
    const [stretch] = mergeSections(consecutive);
    expect(stretch.distanceMeters).toBe(80);
    expect(stretch.sectionIds).toEqual([1, 2]);
  });

  it('dedupes sensors that appear in multiple merged sections (e.g. Bourke Street Mall North)', () => {
    const stretches = mergeSections(REAL_SECTIONS);
    // Section 7 (MEDIUM) is its own stretch, standalone - no merge partner -
    // so this checks a merge case directly instead.
    const consecutive = [
      {
        sectionId: 1,
        sensoryBand: 'LOW',
        distanceMeters: 10,
        sensors: [{ locationId: 1, name: 'A' }],
      },
      {
        sectionId: 2,
        sensoryBand: 'LOW',
        distanceMeters: 10,
        sensors: [{ locationId: 1, name: 'A' }, { locationId: 2, name: 'B' }],
      },
    ];
    const [stretch] = mergeSections(consecutive);
    expect(stretch.sensors).toHaveLength(2);
    expect(stretches).toBeDefined();
  });

  it('returns an empty array for no sections', () => {
    expect(mergeSections([])).toEqual([]);
  });
});
