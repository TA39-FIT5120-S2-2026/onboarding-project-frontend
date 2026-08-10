# Backend gaps

This file records deployment dependencies and known product/data limitations
after the route, refuge, and forecast integration completed on 2026-08-10.
The live JSON contract is documented in `API_CONTRACT.md`.

## Deployment dependencies

- Apply `database/migrations/001_add_refuges_and_hourly_counts.sql` in the
  backend repository.
- Run `node data-import/importRefuges.js` to populate explicit park/library
  refuge rows from the existing landmarks table.
- Validate historical mapping with
  `node data-import/importHistoricalPedestrianCounts.js --limit=1000`.
- The full 2009-present historical import remains approval-gated. Until enough
  rows exist, forecast intentionally returns `sufficientHistory: false`.
- The frontend uses live endpoints unless `VITE_USE_FIXTURES=true`; production
  errors never silently substitute bundled sample data.

## Remaining data/product gaps

1. **No verified quiet-space source.** The refuge importer never infers
   `quiet_space` from arbitrary landmarks. Zero results are correct until a
   curated, defensible dataset or product-owned list is supplied.
2. **Sparse refuge coverage.** The existing landmarks source legitimately
   supports some parks/gardens/reserves and libraries, but it is not a complete
   refuge catalogue - inside the CBD polygon it's 12 parks/gardens, 10
   galleries/museums, but only **2 libraries** (Athenaeum + State Library), so
   the library filter will look sparse. A richer authoritative source should
   follow the existing import-to-MySQL architecture.
3. **No general public-transport access-point dataset.** Southern Cross Station
   is one explicit route gateway, not a nearest-stop feature. The UI still
   cannot show the nearest tram/train stop at both route ends.
4. **No street-name join for route sections.** Sensor-influence sections and
   ORS walking steps have no shared stable reference, so the frontend correctly
   renders them as separate views.
5. **Route IDs are response-local.** A `routeId` is a 1-based index within one
   `/api/routes/plan` response and must not be persisted across planning calls.
6. **Errors have no machine-readable code.** The frontend currently maps HTTP
   status and displays safe backend messages.

## Deliberately unchanged behaviour

- Route ranking remains band, peak, average, duration, then distance. The
  frontend mirrors that rule in its explicit test fixtures. **This also means
  AC 1.2.2 and AC 1.3.3 are not literally satisfied** - both say "the route
  with the lowest pedestrian exposure is marked Recommended" / "the
  lowest-exposure route available is displayed," but ranking by peak before
  average means the recommended/fallback route is not always the lowest-average
  one. Confirmed against the live backend (State Library → Town Hall): a
  1-sensor route (avg 69, peak 69) outranked a 7-sensor route (avg 36, peak
  86). `RouteExposureStats.jsx` shows average, peak and sensor count on every
  card so this is visible rather than hidden, but the AC wording and the
  ranking rule still disagree - worth reconciling one way or the other.
- Sensor matching remains at the configured backend radius.
- The existing sensory thresholds, tolerance rules, freshness policy, and
  congested-section algorithm are unchanged.
- `GET /api/routes/:id` is unnecessary because `/api/routes/plan` already
  returns route sections and sensor exposure for the session-held alternatives.
