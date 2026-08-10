// Static place list standing in for a geocoder - no third-party lookup, so
// nothing the user types leaves the device (see docs/PLACE_DATA.md for why,
// given the no-login/no-storage privacy stance for this user group).
//
// GENERATED_CBD_PLACES comes from real City of Melbourne landmarks,
// verified against the backend's actual CBD polygon by
// scripts/generate-cbd-places.mjs. COLLOQUIAL_PLACES fills in names the
// landmarks dataset lacks but people will type (also verified).
// OUTSIDE_COVERAGE_PLACES are real places the backend's polygon rejects -
// kept selectable so AC 1.1.1 Scenario 3 (destination outside the CBD)
// stays reachable from the combobox, not just from free text.

import { GENERATED_CBD_PLACES } from './cbdPlaces.generated.js';
import { COLLOQUIAL_PLACES, OUTSIDE_COVERAGE_PLACES } from '../../scripts/placeOverrides.js';

export const CBD_BBOX = {
  minLat: -37.8226,
  maxLat: -37.8058,
  minLng: 144.9491,
  maxLng: 144.9749,
};

export const CBD_PLACES = [...GENERATED_CBD_PLACES, ...COLLOQUIAL_PLACES, ...OUTSIDE_COVERAGE_PLACES];

export function findPlace(id) {
  return CBD_PLACES.find((place) => place.id === id) ?? null;
}

export function findPlaceByName(name) {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return null;

  const exact = CBD_PLACES.find((place) => place.name.toLowerCase() === normalized);
  if (exact) return exact;

  // Fall back to search: if typing narrows to exactly one place, resolve it
  // ("flinders" -> Flinders Street Station) without requiring the full name.
  const matches = searchPlaces(name);
  return matches.length === 1 ? matches[0] : null;
}

export function isWithinCbd(lat, lng) {
  return (
    lat >= CBD_BBOX.minLat &&
    lat <= CBD_BBOX.maxLat &&
    lng >= CBD_BBOX.minLng &&
    lng <= CBD_BBOX.maxLng
  );
}

function normalise(text) {
  return text.trim().toLowerCase();
}

// Tiered prefix + fuzzy matching for the combobox. Each tier is internally
// alphabetical; tiers are concatenated and deduped, so a name-prefix match
// always outranks a looser one.
export function searchPlaces(query, limit = 8) {
  const q = normalise(query);
  if (!q) return [];

  const seen = new Set();
  const results = [];

  function addAll(places) {
    for (const place of places) {
      if (results.length >= limit) return;
      if (seen.has(place.id)) continue;
      seen.add(place.id);
      results.push(place);
    }
  }

  const byNamePrefix = CBD_PLACES.filter((p) => normalise(p.name).startsWith(q)).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  addAll(byNamePrefix);
  if (results.length >= limit) return results;

  const byWordPrefix = CBD_PLACES.filter((p) =>
    normalise(p.name)
      .split(/\s+/)
      .some((word) => word.startsWith(q)),
  ).sort((a, b) => a.name.localeCompare(b.name));
  addAll(byWordPrefix);
  if (results.length >= limit) return results;

  // Subsequence fuzzy match: every character of q appears in order within
  // the place name (not necessarily contiguous) - "mlbcen" still finds
  // "Melbourne Central".
  function isSubsequence(needle, haystack) {
    let i = 0;
    for (const char of haystack) {
      if (char === needle[i]) i += 1;
      if (i === needle.length) return true;
    }
    return needle.length === 0;
  }

  const byFuzzy = CBD_PLACES.filter((p) => isSubsequence(q, normalise(p.name))).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  addAll(byFuzzy);

  return results;
}
