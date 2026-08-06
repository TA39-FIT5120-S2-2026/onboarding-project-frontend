export const REFUGE_CATEGORY_LABELS = {
  park: 'Park',
  library: 'Library',
  quiet_space: 'Quiet space',
};

export const REFUGE_CATEGORY_COLORS = {
  park: '#2F6E3B',
  library: '#2A4B7C',
  quiet_space: '#5B3A8C',
};

// Raw SVG <path> "d" data, shared between the React-rendered legend icon
// (RefugeIcon.jsx) and the raw HTML string Leaflet needs for map markers
// (RefugeMarker.jsx) so the two only ever draw the same shape.
export const REFUGE_CATEGORY_PATHS = {
  park: 'M8 1 3 9h3v6h4V9h3z',
  library: 'M2 2h5v12H2zM9 2h5v12H9zM4 4h1v8H4zM11 4h1v8h-1z',
  quiet_space: 'M11 2a6 6 0 1 0 3 11.2A7 7 0 0 1 11 2z',
};

export function refugeCategoryLabel(category) {
  return REFUGE_CATEGORY_LABELS[category] ?? category;
}
