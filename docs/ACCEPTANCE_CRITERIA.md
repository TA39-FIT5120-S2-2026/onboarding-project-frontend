# Acceptance Criteria - Quiet Compass

15 acceptance criteria, 28 scenarios, across 2 epics and 5 user stories.
Approved to proceed by the industry mentor on 6 August 2026.

**This is the authoritative list.** If code and this file disagree, this file wins.
Epics and user stories are supplied by the mentors and are not to be reworded.

---

## The rule

```
Given [which page the user is on, and any relevant state],

when [something the user DOES, or a state change / background event],

then [something the user can SEE or verify on screen].
```

**Not an acceptance criterion:**
- "the system uses real data, not mock data" - a test case, the user cannot verify it
- "the system calculates X" - unless X appears on screen
- "sensors within 200 metres" - backend condition, invisible
- "the system stores Y" - invisible

If a reviewer cannot click through and mark it pass or fail, it is not an acceptance criterion.

**One scenario per user interaction.** Where a criterion has more than one logical branch, such as a success path and a negative or edge case, it is written as separate named scenarios inside the same criterion rather than bundled into one Then clause.

---

## Pages

| Page | Route | Purpose |
|---|---|---|
| Route Planner | `/` | Enter origin and destination |
| Route Results | `/routes` | Route options with sensory ratings |
| Route Detail | `/routes/:id` | Map, warnings, alternative route |
| Sensory Refuges | `/refuges` | Nearby quiet spaces |
| Forecast | `/forecast` | Next-hour predicted conditions |
| Check-in | modal | Optional sensitivity prompt (innovation) |

---

## Bands

| Band | Range |
|---|---|
| LOW | under 50 counts per minute |
| MEDIUM | 50 to 149 |
| HIGH | 150 and above |
| NO_DATA | no sensor within 50m of that segment (backend `SENSOR_ROUTE_RADIUS_METERS`; see `docs/BACKEND_GAPS.md`) |

Source: Crowd Density Classification, tech mentor's Sample Data Management Plan.
`NO_DATA` is never rendered as `LOW`.

The agreed sensory factor for this iteration is **pedestrian volume only**. Construction and events are in the backlog.

---

# EPIC 1: Sensory-Aware Route Planning

## US 1.1: Route Sensory Indicator

### AC 1.1.1: Generate routes from origin and destination · Size 5

**Scenario 1: Successful route generation**
> Given a user is on the Route Planner page,
>
> when the user enters a valid origin and destination within Melbourne CBD and selects Plan Route,
>
> then the Route Results page displays at least one walking route with its walking time and distance.

**Scenario 2: Public transport access points shown**
> Given a route is displayed on the Route Results page,
>
> when the route is shown,
>
> then the nearest tram stop or train station is displayed at both the origin and the destination.

**Scenario 3: Destination outside the CBD**
> Given a user is on the Route Planner page,
>
> when the user enters an origin or destination outside the Melbourne CBD boundary and selects Plan Route,
>
> then a message states that the location is outside the supported area and no route is generated.

**Data source:** Sensor Locations [data.melbourne.vic.gov.au] · Public Transport Lines and Stops [opendata.transport.vic.gov.au]
**DoD link:** Epic 1 - "User can enter a destination within Melbourne CBD" · "System generates at least one sensory-aware route" · "Walking routes integrate with public transport access points"

**Tasks**
1. Build origin and destination inputs with CBD validation
2. Connect Plan Route to the routing service
3. Build Route Results page layout
4. Display walking time and distance per route
5. Load and display nearest PTV access point at both ends
6. Handle out-of-boundary input with a clear message

---

### AC 1.1.2: Display sensory indicator on each route · Size 5

> Given a user is on the Route Results page,
>
> when the route options are displayed,
>
> then each route shows a sensory indicator labelled Low, Medium or High, together with the pedestrian count per minute the label is based on, conveyed by text and icon rather than colour alone.

**Data source:** Pedestrian Counts per Hour, Sensor Locations [data.gov.au]
**DoD link:** Epic 1 - "Routes are assigned a sensory indicator based on agreed factors" · "Accessibility and usability testing completed"
**Agreed factor for this iteration:** pedestrian volume. Three bands are used, taken from the Crowd Density Classification in the tech mentor's Sample Data Management Plan.

**Tasks**
1. Define band constants: Low under 50, Medium 50–149, High 150 and above
2. Build the indicator component with text label and icon
3. Display the underlying count alongside the label
4. Unit test boundary values 49, 50, 149, 150
5. Verify WCAG AA contrast and non-colour-only presentation

---

### AC 1.1.3: Show data source and freshness · Size 3

**Scenario 1: Indicator detail displayed**
> Given a user is on the Route Results page,
>
> when the user selects a route's sensory indicator,
>
> then the sensor name, pedestrian count, time of the reading and data source attribution are displayed.

**Scenario 2: Route section with no sensor coverage**
> Given a user is on the Route Results page and a route section has no sensor reading,
>
> when the user selects that route's sensory indicator,
>
> then the section is shown as "no data" rather than being labelled Low.

**Data source:** Pedestrian Counts per Hour, Sensor Locations [data.gov.au]
**DoD link:** Epic 1 - "System generates at least one sensory-aware route… including pedestrian density information"

**Tasks**
1. Build expandable detail panel on the indicator
2. Display sensor name and reading timestamp
3. Add City of Melbourne CC BY 4.0 attribution
4. Display "no data" state for uncovered sections

---

## US 1.2: Avoid Congested Corridors

### AC 1.2.1: Compare routes side by side · Size 3

> Given a user is on the Route Results page with two or more routes,
>
> when the routes are listed,
>
> then each route displays its walking time, pedestrian count and sensory band together so the trade-off is visible before selecting.

**Data source:** Real-time Pedestrian Counting System [melbourne.vic.gov.au]
**DoD link:** Epic 1 - "Routes are assigned a sensory indicator based on agreed factors"

**Tasks**
1. Build the comparison layout
2. Display time, count and band per route
3. Test with a destination that has clearly different route options

---

### AC 1.2.2: Recommend the lowest-exposure route · Size 3

> Given a user is on the Route Results page with two or more routes,
>
> when the routes are listed,
>
> then the route with the lowest pedestrian exposure is marked Recommended, appears first, and shows a plain-language reason for the recommendation.

**Data source:** Real-time Pedestrian Counting System [melbourne.vic.gov.au]
**DoD link:** Epic 1 - "Routes are assigned a sensory indicator based on agreed factors"

**Tasks**
1. Sort route list by exposure ascending
2. Build the Recommended badge
3. Write plain-language reason strings
4. Test ranking on a known peak-hour corridor

---

### AC 1.2.3: Highlight congested sections with a crowd warning · Size 5

**Scenario 1: Congested section highlighted on the map**
> Given a user is on the Route Detail page for a route containing a High-band section,
>
> when the map loads,
>
> then that section is visually distinguished from the rest of the route and a legend explains the distinction.

**Scenario 2: Crowd warning displayed**
> Given a user is on the Route Detail page for a route containing a High-band section,
>
> when the map loads,
>
> then a crowd warning names the affected street section and states the time the pedestrian data was last updated.

**Scenario 3: No congested section**
> Given a user is on the Route Detail page for a route with no High-band section,
>
> when the map loads,
>
> then no crowd warning is displayed.

**Data source:** Real-time Pedestrian Counting System [melbourne.vic.gov.au]
**DoD link:** Epic 1 - sensory indicator · Epic 2 - "Users receive real-time alerts for high-density pedestrian areas"
**Note:** this AC sits under Epic 1 because the alert appears on the route detail page, but it is the criterion that satisfies Epic 2 DoD line 1. Neither US 2.1 nor US 2.2 covers live alerts.

**Tasks**
1. Integrate map rendering library
2. Draw route with per-section styling
3. Build the map legend
4. Build the crowd warning banner with section name and data timestamp
5. Test warning appears at High and not at Low or Medium

---

## US 1.3: Personal Crowd Threshold

### AC 1.3.1: Optional sensitivity check-in ⭐ INNOVATION · Size 8

**Scenario 1: Check-in completed**
> Given a user has selected a route on the Route Results page and the optional check-in is displayed,
>
> when the user selects how they are feeling from the preset options,
>
> then the sensory indicators and route recommendation are re-evaluated against the selected sensitivity level and the updated result is displayed.

**Scenario 2: Check-in dismissed**
> Given a user has selected a route on the Route Results page and the optional check-in is displayed,
>
> when the user dismisses the check-in,
>
> then the default sensitivity level is retained and the user continues to the selected route unchanged.

**Data source:** N/A (user input, not stored beyond the session)
**DoD link:** Epic 1 - "Route recommendations dynamically adjust when crowd levels exceed user-defined limits"

**Tasks**
1. Design the check-in prompt with preset options, no free text
2. Map each option to a crowd tolerance level
3. Apply the selected level to route ranking and warnings
4. Make the prompt dismissible with a clear default
5. Hold the selection for the session only
6. Test both the completed and dismissed paths

---

### AC 1.3.2: Warn and offer an alternative · Size 5

> Given a user is on the Route Detail page for a route that exceeds their selected tolerance,
>
> when the page loads or refreshes,
>
> then a warning states which route exceeds the tolerance, and at least one alternative route within tolerance is offered with its walking time and a one-tap switch.

**Data source:** Real-time Pedestrian Counting System [melbourne.vic.gov.au]
**DoD link:** Epic 1 - "Route recommendations dynamically adjust when crowd levels exceed user-defined limits"

**Tasks**
1. Compare route band against selected tolerance
2. Build the tolerance warning component
3. Generate and display alternative routes within tolerance
4. Add one-tap switch to the alternative
5. Test at each tolerance level

---

### AC 1.3.3: State clearly when no route qualifies · Size 3

> Given a user is on the Route Detail page and no available route falls within their selected tolerance,
>
> when the page loads,
>
> then a message states that no route meets the selected tolerance, and the lowest-exposure route available is displayed labelled as not meeting the tolerance rather than presented as compliant.

**Data source:** Real-time Pedestrian Counting System [melbourne.vic.gov.au]
**DoD link:** Epic 1 - "Route recommendations dynamically adjust when crowd levels exceed user-defined limits"

**Tasks**
1. Detect the no-qualifying-route case
2. Build the message component
3. Label the fallback route honestly
4. Test with the strictest tolerance during peak hour

---

# EPIC 2: Sensory Environment Monitoring

## US 2.1: Sensory Refuge Locations

### AC 2.1.1: Display refuges on the map · Size 5

> Given a user is on the Sensory Refuges page,
>
> when the page loads with a selected location or active route,
>
> then nearby parks, libraries and quiet public spaces within 500 metres appear as distinct map markers, with a legend distinguishing them from route markers.

**Data source:** Landmarks and places of interest, open space and parks [melbourne.vic.gov.au]
**DoD link:** Epic 2 - "Nearby sensory refuge locations are displayed on demand"

**Tasks**
1. Ingest landmarks, open space and parks datasets
2. Define which categories qualify as sensory refuges
3. Build refuge marker component
4. Render markers within a 500m radius
5. Add legend entry

---

### AC 2.1.2: Show refuge detail on selection · Size 3

**Scenario 1: Complete refuge record**
> Given a user is on the Sensory Refuges page with markers displayed,
>
> when the user selects a marker,
>
> then the refuge name, category, address and walking distance are displayed.

**Scenario 2: Incomplete refuge record**
> Given a refuge has a field missing from the dataset,
>
> when the user selects that refuge's marker,
>
> then the missing field is shown as unavailable rather than left blank.

**Data source:** Landmarks and places of interest [melbourne.vic.gov.au]
**DoD link:** Epic 2 - "Nearby sensory refuge locations are displayed on demand"

**Tasks**
1. Build refuge detail popup
2. Display name, category, address, walking distance
3. Handle missing fields explicitly
4. Test with a refuge that has incomplete data

---

### AC 2.1.3: Filter refuges by type · Size 3

**Scenario 1: Filter applied**
> Given a user is on the Sensory Refuges page,
>
> when the user selects one or more refuge types from the filter,
>
> then only refuges of the selected types remain visible on the map.

**Scenario 2: No refuges match the filter**
> Given a user is on the Sensory Refuges page,
>
> when the selected filter returns no refuges within range,
>
> then a message states that no refuges of the selected types were found nearby.

**Data source:** Landmarks and places of interest [melbourne.vic.gov.au]
**DoD link:** Epic 2 - "Nearby sensory refuge locations are displayed on demand"

**Tasks**
1. Build filter controls for park, library, quiet public space
2. Apply filter to displayed markers
3. Build the empty-result message
4. Test each filter combination

---

## US 2.2: Next-Hour Predictive Alerts

### AC 2.2.1: Display next-hour forecast · Size 8

> Given a user is on the Forecast page,
>
> when the user selects an area or sensor location,
>
> then predicted pedestrian levels for the next 60 minutes are displayed as a timeline, labelled as an estimate based on historical patterns and visually distinguished from live readings.

**Data source:** Historical pedestrian patterns and hourly trends [data.gov.au], [melbourne.vic.gov.au]
**DoD link:** Epic 2 - "Predictive alerts are generated using historical pedestrian trends"

**Tasks**
1. Ingest historical hourly pedestrian dataset
2. Build day-of-week and hour-of-day aggregation
3. Build the forecast timeline component
4. Add the historical-patterns disclaimer
5. Visually distinguish predicted from live values
6. Handle areas with insufficient history

---

### AC 2.2.2: Classify the predicted level · Size 3

> Given a user is on the Forecast page with a forecast displayed,
>
> when the predicted level is shown,
>
> then it is labelled Low, Medium or High using the same bands as the route indicator.

**Data source:** Historical pedestrian patterns and hourly trends [data.gov.au]
**DoD link:** Epic 2 - "Predictive alerts are generated using historical pedestrian trends"

**Tasks**
1. Reuse band constants from AC 1.1.2
2. Apply classification to forecast values
3. Display the label alongside the timeline
4. Test each band

---

### AC 2.2.3: Predictive alert on the planner · Size 5

> Given a user is on the Route Planner page with a previously selected route,
>
> when the predicted level for that route in the next hour is High,
>
> then an alert names the location and the expected busy period, states that it is an estimate, and offers a link to the forecast.

**Data source:** Historical pedestrian patterns and hourly trends [data.gov.au]
**DoD link:** Epic 2 - "Predictive alerts are generated using historical pedestrian trends"

**Tasks**
1. Hold the most recent route for the session
2. Check the forecast on Route Planner load
3. Build the predictive alert banner
4. Display location, time window and estimate disclaimer
5. Link the alert to the Forecast page
6. Test alert appears at High and not at Low or Medium

---

# COVERAGE CHECK

## Every user story has three acceptance criteria

| User story | AC |
|---|---|
| US 1.1 Route sensory indicator | 1.1.1, 1.1.2, 1.1.3 |
| US 1.2 Avoid congested corridors | 1.2.1, 1.2.2, 1.2.3 |
| US 1.3 Personal crowd threshold | 1.3.1, 1.3.2, 1.3.3 |
| US 2.1 Sensory refuge locations | 2.1.1, 2.1.2, 2.1.3 |
| US 2.2 Next-hour predictive alerts | 2.2.1, 2.2.2, 2.2.3 |

## Epic 1 Definition of Done

| DoD line | Covered by |
|---|---|
| User can enter a destination within Melbourne CBD | AC 1.1.1 |
| System generates at least one sensory-aware route using CoM Open Data including pedestrian density | AC 1.1.1, 1.1.2, 1.1.3 |
| Routes are assigned a sensory indicator based on agreed factors | AC 1.1.2 |
| Route recommendations dynamically adjust when crowd levels exceed user-defined limits | AC 1.3.1, 1.3.2, 1.3.3 |
| Walking routes integrate with public transport access points | AC 1.1.1 |
| Accessibility and usability testing completed | AC 1.1.2 plus Usability Testing document card |
| All critical and high-priority defects resolved | Process, tracked on the board |
| Acceptance criteria met and approved by mentors | Process, Review by Mentors lane |

## Epic 2 Definition of Done

| DoD line | Covered by |
|---|---|
| Users receive real-time alerts for high-density pedestrian areas | AC 1.2.3 (cross-epic, see note on that card) |
| Nearby sensory refuge locations displayed on demand | AC 2.1.1, 2.1.2, 2.1.3 |
| Predictive alerts generated using historical pedestrian trends | AC 2.2.1, 2.2.2, 2.2.3 |
| Alert accuracy validated against available city data | Alert Accuracy Validation document card |
| All critical and high-priority defects resolved | Process, tracked on the board |
| Accessibility testing completed and approved | Usability Testing document card |
| Acceptance criteria met and approved by mentors | Process, Review by Mentors lane |

Every DoD line is accounted for. Three are process rather than acceptance criteria, and two are document cards, because neither is something a user can see on screen.

---

## Data sources

| Source | Used by |
|---|---|
| Pedestrian Counting System - Past Hour, Counts per Minute | AC 1.1.2, 1.1.3, 1.2.1, 1.2.2, 1.2.3, 1.3.2, 1.3.3 |
| Pedestrian Counting System - Sensor Locations | AC 1.1.1, 1.1.2, 1.1.3 |
| Pedestrian Counting System - Counts per Hour | AC 2.2.1, 2.2.2, 2.2.3 |
| Landmarks and Places of Interest | AC 2.1.1, 2.1.2, 2.1.3 |
| **Open Space and Parks** (new) | AC 2.1.1, 2.1.2, 2.1.3 |
| **Public Transport Lines and Stops** (new, opendata.transport.vic.gov.au) | AC 1.1.1 |
| OpenRouteService (routing engine, not open data) | AC 1.1.1 |


---

## Build decisions

These are implementation decisions, not acceptance criteria. They are recorded here so both repos agree.

| Decision | Value |
|---|---|
| Default tolerance when the check-in is skipped | `MEDIUM` |
| Where the check-in appears | Modal on Route Results, when a route is selected, before navigating to Route Detail |
| Where the selected route is held | React context, session memory only, never localStorage |
| Refuges or Forecast opened with no active route | Prompt for a location |
| Authentication | None. No accounts, no stored personal data |
| Origin/destination/refuge/forecast location input, since the contract takes `lat,lng` and there is no geocoding endpoint | Static named-place list (`frontend/src/data/cbdPlaces.js`), offered as a labelled type-ahead. A few real landmarks outside the CBD are included deliberately so the out-of-bounds scenario is reachable from the list |
| Forecast area/sensor selector, since there is no endpoint listing sensors | Same named-place list; calls `GET /api/forecast?lat=&lng=`, not `sensorId` |
| Distinguishing predicted from live values on the Forecast page, since `GET /api/forecast` returns predictions only | Live value = the session's most recently selected route's `averageCountPerMinute`, shown as a solid "Now" bar; predicted bars are outlined and tagged "est." No selected route this session means no "Now" bar |
| Frontend test framework, not specified but required by AC 1.1.2's boundary-value task | Vitest + React Testing Library + jsdom |

---

## Implementation status against the current backend

Not a change to the ACs above - this file remains authoritative. Recorded
here because the backend delivered does not implement every endpoint an AC
assumes. Full detail in `docs/BACKEND_GAPS.md`.

| AC | Status |
|---|---|
| 1.1.1 Scenario 1, 3 | Live - `POST /api/routes/plan` |
| 1.1.1 Scenario 2 (access points) | **Blocked** - no PTV data source in the backend |
| 1.1.2, 1.1.3, 1.2.1, 1.2.3, 1.3.1, 1.3.2 | Live |
| 1.2.2, 1.3.3 | **Live, but not literally met** - both say "lowest pedestrian exposure"; the backend ranks by band then peak reading, not average, so the route it picks is not always the lowest-average one. See `docs/BACKEND_GAPS.md` |
| 2.1.1, 2.1.2, 2.1.3 (Sensory Refuges) | **Sample data, undisclosed** - `GET /api/refuges` not implemented; renders bundled sample data as if live (notice removed on product decision, see `docs/ACCESSIBILITY.md`) |
| 2.2.1, 2.2.2, 2.2.3 (Forecast) | **Sample data, undisclosed** - `GET /api/forecast` not implemented; renders bundled sample data as if live (notice removed on product decision, see `docs/ACCESSIBILITY.md`) |

## Related documents

| File | Purpose |
|---|---|
| `API_CONTRACT.md` | Endpoint shapes and field names. Identical in both repos |
| `BACKEND_GAPS.md` | Deviations between this file's assumptions and the backend as built |
| `PLACE_DATA.md` | Where the location picker's place list comes from and how to regenerate it |
| `DATA_MODEL.md` | Database schema and queries (backend only) |
| `ACCESSIBILITY.md` | WCAG AA requirements (frontend only) |
