# TA39 Frontend - Quiet Compass

React + Vite web app helping neurodivergent and sensory-sensitive adults navigate Melbourne CBD by sensory load rather than speed.

No login. No accounts. Nothing stored beyond the browser session.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router |
| Map | Leaflet via react-leaflet |
| HTTP | fetch, wrapped in `src/api/` |
| State | React context for session state, no Redux |
| Styling | Tailwind CSS, meets WCAG AA |
| Icons | lucide-react for UI chrome; band shapes (circle/triangle/square/dash) stay hand-rolled SVG in `BandIcon.jsx` so they're never at the mercy of an icon library's default style |
| Testing | Vitest + React Testing Library + jsdom |
| Linting | ESLint (flat config, incl. `eslint-plugin-jsx-a11y`) + Prettier |

---

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

```
VITE_API_BASE_URL=http://localhost:3000
VITE_USE_FIXTURES=true
```

Other scripts:

```bash
npm run build          # production build
npm run lint            # ESLint
npm run format:check    # Prettier check
npm test                 # Vitest, single run
npm run test:watch       # Vitest, watch mode
```

---

## Folder structure

```
src/
  main.jsx
  App.jsx                       Router
  pages/
    RoutePlanner.jsx
    RouteResults.jsx
    RouteDetail.jsx
    SensoryRefuges.jsx
    Forecast.jsx
    __tests__/
  components/
    ui/                          Design-system primitives, reused across all 5 pages
      Button.jsx                 Polymorphic: renders <Link> when given `to`, else <button>
      Card.jsx
      Stat.jsx                   Big number + small label (the "attractive number" pattern)
      PageHeader.jsx
      Section.jsx
      Callout.jsx                Shared shape for every warning/info box (role passed by caller)
    layout/
      AppShell.jsx               Skip link, mobile top bar, <main>
      NavBar.jsx                 Bottom tabs <md, left rail >=md, with icons + privacy note
      StartOverButton.jsx        Resets session state, with a confirm prompt
    SensoryIndicator.jsx         Low / Medium / High badge
    BandIcon.jsx                 Shape per band (circle/triangle/square/dash)
    BandExplainer.jsx            "How we rate crowd levels" - homepage band walkthrough
    FeatureTeaserCards.jsx       Homepage teaser cards linking to Refuges and Forecast
    IndicatorDetail.jsx          Expandable sensor detail
    RouteCard.jsx
    RouteComparisonList.jsx
    RecommendedBadge.jsx
    BandLegend.jsx
    CheckInModal.jsx             The innovation
    CrowdWarning.jsx
    ToleranceWarning.jsx
    AlternativeRouteCard.jsx
    NoQualifyingRouteMessage.jsx
    PredictiveAlert.jsx
    RouteMap.jsx
    MapLegend.jsx
    RefugeMap.jsx
    RefugeMarker.jsx
    RefugeIcon.jsx
    RefugeDetail.jsx
    RefugeFilter.jsx             Chip-style type filter with a per-category count
    LocationPinIcon.jsx
    ForecastTimeline.jsx
    EstimateDisclaimer.jsx
    PlaceCombobox.jsx            Labelled type-ahead over cbdPlaces
    AccessPointCard.jsx
    FieldError.jsx
    __tests__/
  context/
    SessionContext.jsx           tolerance + last selected route + in-flight route search
  api/
    client.js                    fetch wrapper, fixture switch, ApiError
    routes.js
    refuges.js
    forecast.js
    __fixtures__/
  data/
    cbdPlaces.js                 Static named-place list standing in for a geocoder
  hooks/
    useFocusTrap.js               Focus trap + Escape + focus-return for CheckInModal
  utils/
    bandLabels.js                 Display strings, icons and colours per band
    tolerance.js                  Check-in options, tolerance comparison
    format.js                     Distance/duration/count/time formatting
    refugeCategories.js           Labels, colours and shapes per refuge category
  test/
    setup.jsx                     jest-dom matchers + global react-leaflet mock
```

---

## Session state

`SessionContext` holds the in-memory state below. Nothing is written to `localStorage` or `sessionStorage` - an ESLint rule (`no-restricted-globals` / `no-restricted-properties`) makes that a lint error, not just a convention.

```js
{
  tolerance: 'MEDIUM',            // default when check-in is skipped
  lastSelectedRoute: null,        // route object; used by PredictiveAlert and Forecast's "Now" bar
  routes: [],                     // most recent GET /api/routes result, kept for Route Detail's
                                   // alternative-route lookup and the "compare again" flow
  accessPoints: null,
  toleranceApplied: 'MEDIUM',
  noRouteMeetsTolerance: false,
  origin: null,                   // { id, name, lat, lng } from data/cbdPlaces.js
  destination: null,              // same shape; also used by Refuges/Forecast to prefill a location
  checkInSeen: false,              // check-in shows once per session
}
```

`tolerance` and `lastSelectedRoute` are the two fields the acceptance criteria call out directly. `routes`, `accessPoints`, `toleranceApplied` and `noRouteMeetsTolerance` were added because Route Detail (AC 1.3.2, 1.3.3) needs the full route list and the tolerance the API evaluated against to survive navigation from Route Results - `GET /api/routes/:id` does not return them. `origin`/`destination` let Refuges and Forecast prefill a location without a second geocoding step. `checkInSeen` implements "appears once per session" from the Build decisions table.

`resetSession()` sets the whole object back to these defaults. It's exposed via `useSession()` and wired to `StartOverButton.jsx` (mobile top bar, desktop rail) so a user can clear a planned trip without waiting for a refresh - the button confirms first, since it discards an in-progress plan.

---

## Build decisions

Decisions made while building where the docs did not specify an approach. Confirmed with the mentor before implementation; the authoritative list of ACs and scenarios stays in `docs/ACCEPTANCE_CRITERIA.md`.

| Gap | Decision |
|---|---|
| `API_CONTRACT.md` takes `origin`/`destination` as `lat,lng`, but there is no geocoding endpoint | `src/data/cbdPlaces.js` - a static list of ~20 named Melbourne CBD landmarks with coordinates. Origin/destination/refuge-location/forecast-location fields are all a labelled `PlaceCombobox` (native `<input list>` + `<datalist>`) over this list. A handful of real Melbourne landmarks outside the CBD bounding box are included deliberately so AC 1.1.1 Scenario 3 is reachable from the combobox. |
| Forecast's "area or sensor location" selector has no backing endpoint | Same `cbdPlaces.js`; calls `GET /api/forecast?lat=&lng=`, not `sensorId`. |
| AC 2.2.1 requires predicted values "visually distinguished from live readings", but `GET /api/forecast` returns predictions only | Live = `averageCountPerMinute` of `session.lastSelectedRoute`, drawn as a solid "Now" bar with its value shown as text. Predicted bars are outlined/dashed and tagged "est.". No active route this session -> no "Now" bar, predicted-only timeline. |
| No test framework specified, but AC 1.1.2 task 4 requires boundary tests | Vitest + React Testing Library + jsdom. `react-leaflet` is mocked globally in `src/test/setup.jsx` - jsdom cannot run Leaflet's real SVG renderer. |

---

## Fixture scenarios (`VITE_USE_FIXTURES=true`)

`src/api/__fixtures__/index.js` is a mock backend: it encodes the derived-field rules from `API_CONTRACT.md` (`withinTolerance`, `noRouteMeetsTolerance`) the way the real backend would. Production code in `src/api/*.js` never computes a band or a tolerance comparison itself. A test (`fixtures.contract.test.js`) checks every fixture's field names against the contract, so a silent rename fails CI.

| Trigger | Fixture response |
|---|---|
| Origin or destination outside the CBD bounding box | 400 `OUT_OF_BOUNDS` |
| Destination = Flinders Street Station | `routesPeak.json` - all routes MEDIUM/HIGH |
| Flinders Street Station + `tolerance=LOW` | `noRouteMeetsTolerance: true`, every route `withinTolerance: false` |
| Any other CBD destination | `routes.json` - r1 38 LOW (recommended), r2 54 MEDIUM, r3 162 HIGH |
| `GET /api/routes/r3` | Segments include one HIGH (Swanston St) and one `NO_DATA` (Little Lonsdale St) |
| `GET /api/refuges?types=quiet_space` | `refuges: []` - the fixture data has no quiet-space refuge near the default location |
| Forecast for Docklands Library | `sufficientHistory: false`, `timeline: []`, `peakBand: null` |
| Forecast anywhere else | `peakBand: "HIGH"`, `peakWindow: "14:30-14:45"` |

---

## Design system

A UI/UX polish pass (branch `dev-joshua`) rebuilt every page on a shared set of primitives in `src/components/ui/`, after peer-review usability feedback on a past onboarding project flagged inconsistent styling between pages, tiny type, and a homepage with no reason to scroll. Full critique-by-critique traceability is in `docs/PEER_REVIEW_RESPONSE.md`.

**Type scale** (`tailwind.config.js` `theme.extend.fontSize`) - `display` / `display-sm` / `heading` / `heading-sm` / `body` / `caption` / `micro`, used instead of ad hoc `text-sm`/`text-lg` picks, so every page shares one type rhythm.

**Principle - "calm but confident":** win legibility and hierarchy through type scale and whitespace, never through a second accent colour, a gradient, or motion. `Stat.jsx` is the one place a number gets to be large; everything else stays quiet. This resolves the two-sided peer-review feedback (reviewers wanted "big attractive numbers" and disliked "busy" pages) without breaking CLAUDE.md's calm, low-stimulation, one-accent-colour rule for a sensory-sensitive audience.

**Primitives:**

| Component | Purpose |
|---|---|
| `Button` | Polymorphic CTA - `to` prop renders a `react-router` `Link`, otherwise a `<button>` (callers still set `type` explicitly) |
| `Card` | The one card look, `highlighted` prop for the accent ring (Recommended route, etc.) |
| `Stat` | Icon + big number + small label |
| `PageHeader` | Consistent title/description/back-link opening for every page |
| `Section` | Consistent vertical rhythm between page blocks |
| `Callout` | Shared shape for every warning/info box. `tone="alert"` (band-high colours) or `tone="info"` (accent tint); the caller passes `role="alert"` when the box must be announced - `CrowdWarning`, `ToleranceWarning`, `NoQualifyingRouteMessage` and `PredictiveAlert` all render through this now instead of four near-identical hand-rolled boxes |

Band colours in `tailwind.config.js` are still checked against the WCAG relative-luminance formula before use, not eyeballed - `band.medium` was darkened from an initial pick that measured 4.47:1 to `#7A5C0E` (5.51:1) for exactly this reason.

---

## Pages

### 1. Route Planner (homepage) - `/`

**Covers AC 1.1.1 scenario 1 and 3, AC 2.2.3**

Stays on `/` - the acceptance criteria pin Route Planner to this path - but is no longer just a bare form. Top to bottom:

- Predictive alert banner when `lastSelectedRoute` exists and its next-hour forecast is HIGH
- A short hero (what the app does, in two sentences) beside a "why crowd level, not just speed" card
- The origin/destination form as the clear primary action
- `BandExplainer` - Low/Medium/High spelled out before a first-time user meets them on the results page
- `FeatureTeaserCards` - links into Refuges and Forecast, so a first visit doesn't hide two of the app's three features behind the nav

**Predictive alert must show:** location name, expected busy period, the words "estimate based on historical patterns", and a link to Forecast.

**Out-of-bounds input:** show the API's message inline near the field. Do not navigate.

---

### 2. Route Results - `/routes`

**Covers AC 1.1.1 scenario 2, AC 1.1.2, AC 1.1.3, AC 1.2.1, AC 1.2.2, AC 1.3.1**

Each route card shows: walking time, distance, pedestrian count per minute, sensory band, and a Recommended badge on the lowest-exposure route which sorts first.

Nearest tram stop or train station displayed at both origin and destination.

Tapping the sensory indicator expands to show sensor name, count, reading time, and the City of Melbourne CC BY 4.0 attribution. A segment with `band: "NO_DATA"` renders as "No sensor data" - never as Low.

**Selecting a route opens `CheckInModal` before navigating to Route Detail.**

---

### 3. Check-in modal - the innovation

**Covers AC 1.3.1**

Appears once, when a route is selected on Route Results.

| Option | Maps to tolerance |
|---|---|
| Feeling okay today | HIGH |
| A bit sensitive today | MEDIUM |
| Very sensitive today | LOW |
| Skip | keeps default MEDIUM |

- Preset options only. No free text.
- Selecting an option re-requests routes with the new tolerance and shows the updated result before navigating.
- Skip or dismiss keeps the default and navigates unchanged.
- Must be closable by Escape key and have a visible close control.

---

### 4. Route Detail - `/routes/:id`

**Covers AC 1.2.3, AC 1.3.2, AC 1.3.3**

- Map with the route drawn
- HIGH-band segments visually distinguished, with a legend explaining the distinction
- `CrowdWarning` naming the affected street section and the data last-updated time
- `ToleranceWarning` when the route exceeds the session tolerance, offering an alternative route within tolerance with its walking time and a one-tap switch
- When no route qualifies: a clear message plus the lowest-exposure option, visibly labelled as not meeting the tolerance

---

### 5. Sensory Refuges - `/refuges`

**Covers AC 2.1.1, AC 2.1.2, AC 2.1.3**

- Map with refuge markers within 500m, visually distinct from route markers, with a legend
- Type filter: park, library, quiet space
- Selecting a marker shows name, category, address, walking distance
- Any `null` field renders as "Unavailable", never blank
- Empty filter result shows "No refuges of the selected types found nearby"

If no route is active, prompt for a location before searching.

---

### 6. Forecast - `/forecast`

**Covers AC 2.2.1, AC 2.2.2**

- Area or sensor selector
- Timeline of predicted counts for the next 60 minutes
- Each point labelled Low, Medium or High
- Visually distinct from live readings - different fill, and a legend saying which is which
- Persistent label: "Estimate based on historical patterns"
- `sufficientHistory: false` shows "Not enough historical data for this location"

---

## Accessibility - not optional

Our users are the reason this exists. Every one of these is checked before a card moves to Done.

- **Never colour alone.** Every band has a text label and a distinct icon shape.
- Contrast 4.5:1 minimum on all text.
- Every interactive element reachable by keyboard, visible focus ring.
- The check-in modal traps focus and closes on Escape.
- Map markers have accessible names.
- Warnings use `role="alert"`.
- Test with a screen reader before marking any UI card Done.

---

## Band display - `utils/bandLabels.js`

```js
export const BAND_LABELS = {
  LOW:     { text: 'Low',     icon: 'circle'   },
  MEDIUM:  { text: 'Medium',  icon: 'triangle' },
  HIGH:    { text: 'High',    icon: 'square'   },
  NO_DATA: { text: 'No sensor data', icon: 'dash' }
};
```

Different shapes, not just different colours. This is the single most important accessibility decision in the app.

---

## Definition of Done for a frontend PR

- Acceptance criterion on the LeanKit card is met
- Contrast and keyboard navigation checked
- Band conveyed by text and shape, not colour alone
- ESLint and Prettier clean
- Reviewed by someone who did not write it
- No API keys in the frontend

---

## Build order

1. Router, layout, `SessionContext`
2. `SensoryIndicator` and `bandLabels`
3. Route Planner form
4. Route Results with route cards
5. `IndicatorDetail`
6. Route Detail with map and `CrowdWarning`
7. `CheckInModal` and tolerance wiring
8. `ToleranceWarning` and the no-qualifying-route state
9. Sensory Refuges
10. Forecast
11. `PredictiveAlert` on Route Planner

Steps 1 to 4 need only `GET /api/routes`, so start as soon as the backend has that endpoint.

---

## Working against an unfinished backend

Do not block. Put a fixture in `src/api/__fixtures__/` matching the response shape in the backend README, and switch on an env flag:

```
VITE_USE_FIXTURES=true
```

Delete the flag before the Week 3 deployment. Fixtures are for development only - the deployed build must use real data. The test suite always runs with `VITE_USE_FIXTURES=true` (set in `vite.config.js`'s `test.env`), regardless of the local `.env` file, so tests are deterministic.
