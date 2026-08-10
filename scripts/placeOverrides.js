// Curated additions/exclusions for the generated CBD place list. Hand
// maintained - see docs/PLACE_DATA.md for when to touch this file.

// Themes worth offering as walkable destinations. Excludes Vacant Land,
// Industrial, Warehouse/Store, Office, Health Services, Specialist
// Residential Accommodation, Residential Accommodation, Purpose Built -
// not places someone plans a walk *to*.
export const THEME_ALLOWLIST = [
  'Transport',
  'Leisure/Recreation',
  'Place Of Assembly',
  'Place of Worship',
  'Community Use',
  'Education Centre',
  'Mixed Use',
  'Retail',
];

// "Railway Station" is redundant once the feature is already a station;
// shortens labels without losing meaning.
export const NAME_FIXUPS = [[/ Railway Station$/, ' Station']];

// Landmarks table IDs to always drop (data-quality exceptions found by hand,
// e.g. a duplicate or a name too generic to be useful in a picker).
export const MANUAL_EXCLUDE_IDS = [];

// Names the landmarks table doesn't have under a recognisable label, but
// that anyone using this app will type. Verified against the backend's CBD
// polygon by the same generation script, same as everything else.
export const COLLOQUIAL_PLACES = [
  { id: 'bourke-street-mall', name: 'Bourke Street Mall', lat: -37.8136, lng: 144.9648 },
  { id: 'chinatown', name: 'Chinatown', lat: -37.8118, lng: 144.9698 },
];

// Explicit transport gateways supported by the backend even though their
// exact coordinate falls just outside the CLUE Melbourne (CBD) polygon.
export const SUPPORTED_ACCESS_POINT_PLACES = [
  {
    id: 'southern-cross-station',
    name: 'Southern Cross Station',
    lat: -37.8183,
    lng: 144.9524,
    supportedAccessPoint: true,
  },
];

// Real places just outside the backend's CBD polygon (the CLUE "Melbourne
// (CBD)" small area, which is narrower than colloquial "the CBD" - see
// docs/PLACE_DATA.md), plus places nowhere near it. Kept selectable so
// AC 1.1.1 Scenario 3 (destination outside the CBD) stays reachable from
// the combobox. `farFromCbd: true` places get no special UI treatment
// (obviously wrong choice); `nearCbd: true` places get an "outside our
// coverage area" hint before submit, since a user could reasonably expect
// them to be included.
export const OUTSIDE_COVERAGE_PLACES = [
  { id: 'flagstaff-gardens', name: 'Flagstaff Gardens', lat: -37.811, lng: 144.954, nearCbd: true },
  {
    id: 'docklands-library',
    name: 'Docklands Library',
    lat: -37.8154,
    lng: 144.9505,
    nearCbd: true,
  },
  {
    id: 'yarra-river-crossing',
    name: 'Yarra River Crossing (Princes Bridge)',
    lat: -37.8199,
    lng: 144.9682,
    nearCbd: true,
  },
  { id: 'etihad-stadium', name: 'Marvel Stadium', lat: -37.8164, lng: 144.9475, farFromCbd: true },
  {
    id: 'crown-casino-riverside',
    name: 'Southbank Promenade',
    lat: -37.8245,
    lng: 144.9631,
    farFromCbd: true,
  },
  {
    id: 'melbourne-cricket-ground',
    name: 'Melbourne Cricket Ground',
    lat: -37.8199,
    lng: 144.9834,
    farFromCbd: true,
  },
  {
    id: 'royal-botanic-gardens',
    name: 'Royal Botanic Gardens',
    lat: -37.8304,
    lng: 144.9796,
    farFromCbd: true,
  },
  { id: 'st-kilda-beach', name: 'St Kilda Beach', lat: -37.8677, lng: 144.9797, farFromCbd: true },
];
