# API Contract - Quiet Compass

**This file must be identical in both repos.** If you change it in one, copy it to the other in the same pull request.

Base URL comes from `VITE_API_BASE_URL` (frontend) or `PORT` (backend).
No authentication. No cookies. No session headers.

This file documents the backend **as built**, verified by reading
`onboarding-project-backend/src` and probing the running server. It replaces
an earlier version of this contract that the backend did not implement (see
`docs/BACKEND_GAPS.md` for what changed and why, and for known deviations
still open).

---

## Conventions

- All responses are JSON, wrapped in an envelope: `{ success, message, data }` on 2xx, `{ success: false, message }` on error.
- Field names inside `data` are **camelCase**.
- Distances are in **metres**, durations given in both **seconds** and **minutes**, pedestrian counts are **per minute**.
- Coordinates are `latitude`/`longitude` in request bodies, `lat`/`lng` in the frontend's own place data.
- Route and section geometry is GeoJSON (`{ type: "LineString", coordinates: [[lng, lat], ...] }`).

## Band values

Only these four strings ever appear in a `sensoryBand` field:

```
"LOW"      under 50 counts per minute
"MEDIUM"   50 to 149
"HIGH"     150 and above
"NO_DATA"  no sensor within 50m of that section
```

`NO_DATA` is never substituted with `LOW`. The 50m radius is set by
`SENSOR_ROUTE_RADIUS_METERS` in the backend's `.env` (see `docs/BACKEND_GAPS.md`).

## Error shape

```json
{
  "success": false,
  "message": "Origin and destination must be within Melbourne CBD."
}
```

There is no machine-readable error code. The frontend maps HTTP status to
copy (`src/api/errors.js`); `message` is plain language and safe to show
directly to the user.

| Status | When |
|---|---|
| 400 | Missing/invalid coordinates, or origin/destination outside the CBD (`data.canPlanRoute: false` is also present - see below) |
| 404 | Routing engine returned zero routes |
| 500 | No OpenRouteService API key configured, or an unhandled error |
| 502 | OpenRouteService request failed |

---

# Endpoints

## GET /api/health

```json
{ "success": true, "message": "Backend is running." }
```

## GET /api/sensors/latest

Most recent reading per active sensor.

```json
{
  "success": true,
  "meta": {
    "source": "City of Melbourne Open Data",
    "fetchedFrom": "onboarding_project database",
    "latestReadingAt": "2026-08-06T14:20:00",
    "sensorCount": 134
  },
  "data": [
    {
      "locationId": 34,
      "name": "Swanston St North",
      "sensorName": "Swanston St North",
      "coordinates": { "latitude": -37.8136, "longitude": 144.9631 },
      "reading": {
        "direction1": 90,
        "direction2": 97,
        "total": 187,
        "sensoryBand": "HIGH",
        "timestamp": "2026-08-06T14:20:00"
      }
    }
  ]
}
```

## POST /api/routes/validate

CBD-boundary pre-check without generating routes.

### Request body

```json
{
  "origin": { "latitude": -37.8103, "longitude": 144.9628 },
  "destination": { "latitude": -37.8183, "longitude": 144.9671 }
}
```

### 200 response

```json
{
  "success": true,
  "message": "Origin and destination are within Melbourne CBD.",
  "data": { "originInsideCbd": true, "destinationInsideCbd": true, "canPlanRoute": true }
}
```

### 400 response (outside CBD)

```json
{
  "success": false,
  "message": "Origin and destination must be within Melbourne CBD.",
  "data": { "originInsideCbd": true, "destinationInsideCbd": false, "canPlanRoute": false }
}
```

## POST /api/routes/plan

Covers AC 1.1.1, 1.1.2, 1.2.1, 1.2.2, 1.2.3, 1.3.1, 1.3.2, 1.3.3.

### Request body

| Field | Required | Format | Notes |
|---|---|---|---|
| `origin` | yes | `{latitude, longitude}` | |
| `destination` | yes | `{latitude, longitude}` | |
| `crowdTolerance` | no | `LOW` \| `MEDIUM` \| `HIGH` | Defaults to `DEFAULT_TOLERANCE` (backend `.env`, currently `MEDIUM`) |

### 200 response (shape, trimmed)

```json
{
  "success": true,
  "message": "Walking route alternatives generated successfully.",
  "data": {
    "origin": { "latitude": -37.8103, "longitude": 144.9628 },
    "destination": { "latitude": -37.8183, "longitude": 144.9671 },
    "routeCount": 2,
    "recommendedRouteId": 1,
    "crowdTolerance": "MEDIUM",
    "acceptableRouteCount": 1,
    "hasAcceptableRoute": true,
    "fallbackRouteId": null,
    "decision": {
      "crowdTolerance": "MEDIUM",
      "toleranceSource": "USER",
      "suitableRouteFound": true,
      "originalTopRankedRouteId": 1,
      "recommendedRouteId": 1,
      "fallbackRouteId": null,
      "alternativeUsed": false,
      "warningRequired": false,
      "reasonCode": "ROUTE_WITHIN_TOLERANCE",
      "message": "The lowest-exposure route is within your selected tolerance."
    },
    "alternativeComparison": null,
    "routes": [
      {
        "routeId": 1,
        "rank": 1,
        "distance": { "meters": 900, "kilometres": 0.9 },
        "duration": { "seconds": 840, "minutes": 14 },
        "exposure": {
          "sensoryBand": "LOW",
          "dataCoverage": "PARTIAL",
          "routeRadiusMeters": 50,
          "matchedSensorCount": 3,
          "averagePedestrianCount": 42,
          "maximumPedestrianCount": 68,
          "latestReadingAt": "2026-08-06T14:20:00",
          "dataSource": "City of Melbourne Open Data",
          "freshnessStatus": "FRESH",
          "staleAfterMinutes": 30,
          "sensors": [
            {
              "locationId": 34,
              "name": "Swanston St North",
              "sensorName": "Swanston St North",
              "coordinates": { "latitude": -37.8136, "longitude": 144.9631 },
              "distanceFromRouteMeters": 12,
              "pedestrianCount": 42,
              "sensoryBand": "LOW",
              "timestamp": "2026-08-06T14:20:00",
              "readingAgeMinutes": 4,
              "freshnessStatus": "FRESH"
            }
          ]
        },
        "routeSections": [
          {
            "sectionId": 1,
            "sensoryBand": "LOW",
            "geometry": { "type": "LineString", "coordinates": [] },
            "startCoordinate": [144.9628, -37.8103],
            "endCoordinate": [144.965, -37.812],
            "distanceMeters": 300,
            "averagePedestrianCount": 42,
            "maximumPedestrianCount": 68,
            "sensorIds": [34],
            "sensors": [],
            "freshnessStatus": "FRESH"
          }
        ],
        "congestedSections": [],
        "geometry": { "type": "LineString", "coordinates": [[144.9628, -37.8103]] },
        "segments": [
          {
            "distance": 900,
            "duration": 840,
            "steps": [
              { "distance": 120, "duration": 96, "type": 11, "instruction": "Head north on Swanston St", "name": "Swanston St", "way_points": [0, 5] }
            ]
          }
        ],
        "withinTolerance": true,
        "recommended": true,
        "fallback": false
      }
    ]
  }
}
```

### Rules

- `routeId` is a **1-based index, unique only within this response** - not a durable identifier. Do not persist it across requests.
- `routes` always has at least one entry on a 200. OpenRouteService is asked for up to 3 alternatives but may return fewer.
- Exactly one route has `recommended: true`.
- `withinTolerance` is `false` when the route's `exposure.sensoryBand` exceeds `crowdTolerance`.
- When `hasAcceptableRoute` is `false`, every route has `withinTolerance: false`; the lowest-exposure route is still returned as `fallbackRouteId`.
- `decision.message` is plain language and drives the recommendation reason shown to the user.
- `alternativeComparison` is present only when `decision.alternativeUsed` is `true`.
- `routeSections` come from slicing the route geometry at sensor-influence boundaries; `startCoordinate`/`endCoordinate` are interpolated points, **not** vertices of `geometry.coordinates` or of any `segments[].steps[].way_points` index. There is no reliable way to join a section to a street name - treat "crowd sections" and "turn-by-turn directions" (`segments[].steps`) as two independent views of the same route.
- `congestedSections` is the subset of `routeSections` with `sensoryBand` of `MEDIUM` or `HIGH`.

---

# Not implemented

These were part of an earlier proposed contract. The backend does not
implement them; the frontend serves bundled sample data instead. **No
visible notice distinguishes it from live data** - see `docs/ACCESSIBILITY.md`
and `docs/BACKEND_GAPS.md`.

| Endpoint | Frontend fallback |
|---|---|
| `GET /api/routes/:id` | Not needed - `POST /api/routes/plan` already returns `routeSections` and `exposure.sensors` per route, held in session |
| `GET /api/refuges` | `src/api/refuges.js` serves `src/api/__fixtures__/refuges.json` unconditionally |
| `GET /api/forecast` | `src/api/forecast.js` serves `src/api/__fixtures__/forecast.json` / `forecastInsufficient.json` unconditionally |

See `docs/BACKEND_GAPS.md` for the full list of deviations and what it would
take to close each gap.

---

## Change process

1. Propose the change in the pull request description.
2. Update this file in **both** repos in the same PR.
3. Update `docs/BACKEND_GAPS.md` if the change closes or adds a gap.
4. Both a frontend and a backend person approve.

Silent field renames are the single most likely way to break this project.
