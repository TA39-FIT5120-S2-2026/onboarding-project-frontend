import { findPlace } from '../data/cbdPlaces.js';

// Encodes the trip (place ids, not coordinates - ids are stable, re-lookup
// via findPlace) into URL query params, so Route Results/Detail can survive
// a refresh by re-planning, without writing anything to localStorage or
// sessionStorage (CLAUDE.md: session memory only, never persisted storage -
// the URL isn't storage, it just isn't kept once the tab closes).
export function buildTripQuery({ origin, destination, tolerance }) {
  const params = new URLSearchParams();
  if (origin?.id) params.set('o', origin.id);
  if (destination?.id) params.set('d', destination.id);
  if (tolerance) params.set('tol', tolerance);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function parseTripQuery(searchParams) {
  const originId = searchParams.get('o');
  const destinationId = searchParams.get('d');
  if (!originId || !destinationId) return null;

  const origin = findPlace(originId);
  const destination = findPlace(destinationId);
  if (!origin || !destination) return null;

  return { origin, destination, tolerance: searchParams.get('tol') || undefined };
}
