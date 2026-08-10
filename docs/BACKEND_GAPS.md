# Backend gaps

The backend was reported complete but did not implement the original
`API_CONTRACT.md`. This records what actually shipped, what the frontend did
to work around it, and what's still worth fixing backend-side. `API_CONTRACT.md`
has been rewritten to document the backend as it actually behaves - this file
is the diff and the punch list, not a duplicate of it.

## What changed and why

The frontend was rewritten to call the backend as-built rather than the
backend being changed to match the original contract (`POST /api/routes/plan`
instead of `GET /api/routes`, a `{success, message, data}` envelope, no
`error.code`). That work is done. What's below is what's still missing or
worth fixing on the backend, for whoever picks it up next.

## Open items, most impactful first

1. **`GET /api/refuges` and `GET /api/forecast` do not exist at all.**
   No controller, service, or route for either. The frontend currently
   serves bundled sample JSON for both pages, with a visible "Sample data"
   notice so it's never mistaken for live data. AC 2.1.x and 2.2.x are only
   demo-able against sample data until these are built.
   - **Refuges is cheap to add.** The `landmarks` table is already seeded
     (242 rows). Inside the CBD polygon: 12 parks/gardens, 10
     galleries/museums, but only **2 libraries** (Athenaeum + State Library) -
     the library filter will look sparse until a richer source is added.
     Only the endpoint is missing.
   - **Forecast is not cheap.** No endpoint *and* no data: only ~2.5 days of
     `pedestrian_counts` are imported (checked directly against the seeded
     DB). A credible next-hour prediction needs day-of-week × hour-of-day
     patterns from the Counts-per-Hour historical dataset over weeks.
     Shipping a forecast off 2.5 days would overstate confidence -
     `docs/ACCESSIBILITY.md` is explicit that this destroys trust with this
     user group, so the frontend deliberately does not attempt it.

2. **Ranking prioritises the single busiest sensor reading over average
   exposure**, which can make a poorly-covered route "Recommended" over a
   well-covered one. Probed directly against the live backend
   (`routeRankingService.js:9-82`, State Library → Town Hall):

   | rank | route | band | avg | peak | sensors | recommended |
   |---|---|---|---|---|---|---|
   | 1 | 3 | MEDIUM | 69 | 69 | **1** | yes |
   | 2 | 2 | MEDIUM | **36** | 86 | 7 | no |

   Route 3 wins on a technicality (its one sensor's peak is lower) despite
   having far less coverage and a higher average than route 2. The frontend
   now shows average, peak and sensor count on every route card
   (`RouteExposureStats.jsx`) rather than re-ranking client-side, so this is
   visible instead of hidden - but ranking by average (or by average with
   sensor-count as a tiebreaker) would likely produce more trustworthy
   recommendations.

2. **`NO_DATA` radius is 50m, not the 200m originally specified.**
   `SENSOR_ROUTE_RADIUS_METERS` in the backend `.env` defaults to 50. One-line
   fix: set it to 200. No code change needed. Until then, a route section
   with a sensor between 50m and 200m away gets a real band instead of
   `NO_DATA` - the opposite of the fail-safe direction, so it's a real
   accuracy gap, not just a documentation mismatch.

3. **No street names on `routeSections`.**
   Sections come from turf `lineSliceAlong` and don't share any index or
   coordinate with ORS `segments[].steps[].name`. The frontend renders "crowd
   sections" (by sensor name, falling back to `Section {id}`) and "walking
   directions" (by ORS step instruction) as two separate lists rather than
   inventing a join. If the backend ever wants a single merged view, it would
   need to carry a shared reference (e.g. tag each `routeSection` with the
   `way_points` range it overlaps) rather than leaving the frontend to guess.

4. **No public-transport access points.**
   The original contract's `accessPoints.origin`/`.destination` (nearest tram
   stop or train station) has no backend equivalent - no PTV dataset is
   ingested. `AccessPointCard` was deleted from the frontend. AC 1.1.1
   Scenario 2 is not currently satisfiable.

5. **`routeId` is a non-durable 1-based index, unique only within one
   `/plan` response.** Fine for the current session-only design (nothing
   persists a route across requests), but would break if anything ever needs
   to reference a route after a follow-up `/plan` call changes the numbering.

6. **Error responses carry no machine-readable code**, only `message` and
   HTTP status. The frontend maps status codes to copy in `src/api/errors.js`.
   If more error cases are added, prefer distinct status codes (already the
   case for CBD-boundary vs. not-found vs. upstream failure) over hoping the
   message text stays stable, since the frontend does not parse `message`.

7. **`POST /api/routes/validate` and `GET /api/sensors/latest` exist but
   were never part of any agreed contract.** `sensors/latest` is now used by
   `src/api/sensors.js`; `validate` is unused by the frontend (planning
   already returns CBD-boundary errors inline). Worth keeping documented in
   `API_CONTRACT.md` rather than removed, since sensors/latest has a live
   caller.

## Also worth knowing

- Database seeding is manual and not wired into `npm run dev`: run
  `data-import/importCbdBoundary.js` (must run first - `cbdValidationService.js`
  hard-requires a `cbd_boundary` row or every `/plan` and `/validate` call
  500s), then `importSensorLocations.js`, then `importPedestrianCounts.js`,
  then `importLandmarks.js`. None of these are wired into `package.json`.
- OpenRouteService's `alternative_routes` is requested with
  `target_count: 3` but may return only 1 route. The frontend handles a
  single-route response (no alternative to switch to).
