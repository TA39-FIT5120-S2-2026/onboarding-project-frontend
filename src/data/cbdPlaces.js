// Static place list standing in for a geocoder. API_CONTRACT.md takes
// origin/destination as `lat,lng`; this list lets the UI offer named
// Melbourne CBD landmarks instead of asking the user to type coordinates.
// A few places outside the CBD boundary are included deliberately so
// AC 1.1.1 Scenario 3 (destination outside the CBD) is reachable from the
// combobox rather than needing free-text entry.

export const CBD_BBOX = {
  minLat: -37.8226,
  maxLat: -37.8058,
  minLng: 144.9491,
  maxLng: 144.9749,
};

export const CBD_PLACES = [
  { id: 'flinders-street-station', name: 'Flinders Street Station', lat: -37.8183, lng: 144.9671 },
  { id: 'southern-cross-station', name: 'Southern Cross Station', lat: -37.8183, lng: 144.9524 },
  { id: 'melbourne-central', name: 'Melbourne Central', lat: -37.8103, lng: 144.9628 },
  { id: 'state-library-victoria', name: 'State Library Victoria', lat: -37.8098, lng: 144.9652 },
  { id: 'bourke-street-mall', name: 'Bourke Street Mall', lat: -37.8136, lng: 144.9648 },
  { id: 'queen-victoria-market', name: 'Queen Victoria Market', lat: -37.8076, lng: 144.9568 },
  { id: 'federation-square', name: 'Federation Square', lat: -37.818, lng: 144.969 },
  { id: 'melbourne-town-hall', name: 'Melbourne Town Hall', lat: -37.8154, lng: 144.9666 },
  { id: 'chinatown', name: 'Chinatown', lat: -37.8118, lng: 144.9698 },
  { id: 'rmit-university', name: 'RMIT University', lat: -37.8076, lng: 144.9631 },
  { id: 'parliament-station', name: 'Parliament Station', lat: -37.8109, lng: 144.9726 },
  { id: 'princes-theatre', name: 'Princes Theatre', lat: -37.8103, lng: 144.9718 },
  { id: 'flagstaff-gardens', name: 'Flagstaff Gardens', lat: -37.811, lng: 144.954 },
  { id: 'docklands-library', name: 'Docklands Library', lat: -37.8154, lng: 144.9505 },
  {
    id: 'yarra-river-crossing',
    name: 'Yarra River Crossing (Princes Bridge)',
    lat: -37.8199,
    lng: 144.9682,
  },
  // Below this line: real Melbourne landmarks outside the CBD bounding box,
  // kept selectable so AC 1.1.1 Scenario 3 is reachable from the combobox.
  { id: 'etihad-stadium', name: 'Marvel Stadium', lat: -37.8164, lng: 144.9475 },
  { id: 'crown-casino-riverside', name: 'Southbank Promenade', lat: -37.8245, lng: 144.9631 },
  {
    id: 'melbourne-cricket-ground',
    name: 'Melbourne Cricket Ground',
    lat: -37.8199,
    lng: 144.9834,
  },
  { id: 'royal-botanic-gardens', name: 'Royal Botanic Gardens', lat: -37.8304, lng: 144.9796 },
  { id: 'st-kilda-beach', name: 'St Kilda Beach', lat: -37.8677, lng: 144.9797 },
];

export function findPlace(id) {
  return CBD_PLACES.find((place) => place.id === id) ?? null;
}

export function findPlaceByName(name) {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return null;
  return CBD_PLACES.find((place) => place.name.toLowerCase() === normalized) ?? null;
}

export function isWithinCbd(lat, lng) {
  return (
    lat >= CBD_BBOX.minLat &&
    lat <= CBD_BBOX.maxLat &&
    lng >= CBD_BBOX.minLng &&
    lng <= CBD_BBOX.maxLng
  );
}
