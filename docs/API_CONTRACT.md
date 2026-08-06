# API Contract - Quiet Compass

**This file must be identical in both repos.** If you change it in one, copy it to the other in the same pull request.

Base URL comes from `VITE_API_BASE_URL` (frontend) or `PORT` (backend).
No authentication. No cookies. No session headers.

---

## Conventions

- All responses are JSON.
- All field names are **camelCase**.
- Distances are in **metres**, times in **minutes**, counts are **per minute**.
- Timestamps are ISO 8601 with Melbourne offset, e.g. `2026-08-06T14:20:00+10:00`.
- Coordinates are `lat` and `lng` as separate numbers, except route geometry which is GeoJSON.
- A missing value is `null`, never an empty string.

## Band values

Only these five strings ever appear in a `band` field:

```
"LOW"      under 50 counts per minute
"MEDIUM"   50 to 149
"HIGH"     150 and above
"NO_DATA"  no sensor within 200m of that segment
```

`NO_DATA` is never substituted with `LOW`.

## Error shape

```json
{
  "error": {
    "code": "OUT_OF_BOUNDS",
    "message": "That location is outside the Melbourne CBD area we cover."
  }
}
```

`message` is shown directly to the user, so it must be plain language.

| Code | Status | When |
|---|---|---|
| `OUT_OF_BOUNDS` | 400 | Origin or destination outside the CBD |
| `MISSING_PARAMETER` | 400 | Required query parameter absent |
| `NO_ROUTE_FOUND` | 404 | Routing engine returned nothing |
| `UPSTREAM_UNAVAILABLE` | 503 | OpenRouteService failed |
| `INTERNAL_ERROR` | 500 | Anything else |

---

# Endpoints

## GET /api/routes

Covers AC 1.1.1, 1.1.2, 1.2.1, 1.2.2, 1.3.2, 1.3.3

### Query parameters

| Name | Required | Format | Notes |
|---|---|---|---|
| `origin` | yes | `lat,lng` | e.g. `-37.8136,144.9631` |
| `destination` | yes | `lat,lng` | |
| `tolerance` | no | `LOW` \| `MEDIUM` \| `HIGH` | Defaults to `MEDIUM` |

### 200 response

```json
{
  "routes": [
    {
      "id": "r1",
      "walkingTimeMinutes": 14,
      "distanceMetres": 900,
      "averageCountPerMinute": 42,
      "band": "LOW",
      "recommended": true,
      "withinTolerance": true,
      "reason": "Lowest pedestrian exposure of the available routes",
      "geometry": {
        "type": "LineString",
        "coordinates": [[144.9631, -37.8136], [144.9652, -37.8098]]
      }
    }
  ],
  "accessPoints": {
    "origin": {
      "name": "Melbourne Central",
      "mode": "train",
      "distanceMetres": 120
    },
    "destination": {
      "name": "Bourke St Mall",
      "mode": "tram",
      "distanceMetres": 60
    }
  },
  "toleranceApplied": "MEDIUM",
  "noRouteMeetsTolerance": false
}
```

### Rules

- `routes` always has at least one entry on a 200.
- Exactly one route has `recommended: true`, and it is the lowest `averageCountPerMinute`.
- Routes are sorted with the recommended one first.
- `withinTolerance` is false when the route's band exceeds `toleranceApplied`.
- When no route is within tolerance, `noRouteMeetsTolerance` is `true` and every route has `withinTolerance: false`. The lowest-exposure route is still returned.
- `accessPoints.origin` or `.destination` is `null` when no stop is within 300m.
- `reason` is plain language, shown to the user.

---

## GET /api/routes/:id

Covers AC 1.1.3, 1.2.3

### 200 response

```json
{
  "id": "r1",
  "segments": [
    {
      "geometry": { "type": "LineString", "coordinates": [] },
      "streetName": "Swanston St",
      "sensorId": 34,
      "sensorName": "Swanston St North",
      "countPerMinute": 187,
      "band": "HIGH",
      "readingTakenAt": "2026-08-06T14:20:00+10:00"
    },
    {
      "geometry": { "type": "LineString", "coordinates": [] },
      "streetName": "Little Lonsdale St",
      "sensorId": null,
      "sensorName": null,
      "countPerMinute": null,
      "band": "NO_DATA",
      "readingTakenAt": null
    }
  ],
  "attribution": "City of Melbourne, CC BY 4.0",
  "dataLastUpdated": "2026-08-06T14:20:00+10:00"
}
```

### Rules

- `streetName` drives the crowd warning text, so it must be present even when the band is `NO_DATA`.
- `dataLastUpdated` is the most recent `readingTakenAt` across all segments.

---

## GET /api/refuges

Covers AC 2.1.1, 2.1.2, 2.1.3

### Query parameters

| Name | Required | Format |
|---|---|---|
| `lat` | yes | number |
| `lng` | yes | number |
| `types` | no | comma separated: `park`, `library`, `quiet_space` |

Omitting `types` returns all types.

### 200 response

```json
{
  "refuges": [
    {
      "id": 12,
      "name": "State Library Victoria",
      "category": "library",
      "address": "328 Swanston St, Melbourne",
      "walkingDistanceMetres": 240,
      "lat": -37.8098,
      "lng": 144.9652
    },
    {
      "id": 47,
      "name": "Flagstaff Gardens",
      "category": "park",
      "address": null,
      "walkingDistanceMetres": 480,
      "lat": -37.8110,
      "lng": 144.9540
    }
  ],
  "searchRadiusMetres": 500
}
```

### Rules

- `category` is always one of `park`, `library`, `quiet_space`.
- `address` may be `null` when the dataset has no address. The frontend renders "Unavailable".
- An empty result is a 200 with `"refuges": []`, not a 404.
- Sorted by `walkingDistanceMetres` ascending.

---

## GET /api/forecast

Covers AC 2.2.1, 2.2.2, 2.2.3

### Query parameters

Either `sensorId`, or `lat` and `lng` together.

### 200 response

```json
{
  "sensorId": 34,
  "sensorName": "Swanston St North",
  "generatedAt": "2026-08-06T14:00:00+10:00",
  "windowMinutes": 60,
  "basis": "historical",
  "sufficientHistory": true,
  "timeline": [
    { "minutesAhead": 15, "predictedCount": 92,  "band": "MEDIUM" },
    { "minutesAhead": 30, "predictedCount": 164, "band": "HIGH" },
    { "minutesAhead": 45, "predictedCount": 171, "band": "HIGH" },
    { "minutesAhead": 60, "predictedCount": 130, "band": "MEDIUM" }
  ],
  "peakBand": "HIGH",
  "peakWindow": "14:30-14:45"
}
```

### Rules

- `basis` is always `"historical"`. The frontend uses it to render the estimate disclaimer, so it is never omitted.
- `sufficientHistory: false` returns `"timeline": []`, `"peakBand": null`, `"peakWindow": null`.
- `peakBand` is the highest band in the timeline.
- `peakWindow` is a human-readable local time range, used verbatim in the predictive alert.

---

## Change process

1. Propose the change in the pull request description.
2. Update this file in **both** repos in the same PR.
3. Update the fixture in `frontend/src/api/__fixtures__/` to match.
4. Both a frontend and a backend person approve.

Silent field renames are the single most likely way to break this project.
