export const BAND_LABELS = {
  LOW: { text: 'Low', description: 'Under 50 people per minute', icon: 'circle' },
  MEDIUM: { text: 'Medium', description: '50 to 149 people per minute', icon: 'triangle' },
  HIGH: { text: 'High', description: '150 or more people per minute', icon: 'square' },
  NO_DATA: { text: 'No sensor data', description: 'No sensor within 200 metres', icon: 'dash' },
};

export const BAND_ORDER = ['LOW', 'MEDIUM', 'HIGH'];

// Mirrors the band.* colours in tailwind.config.js. Kept as plain hex here
// because map/SVG drawing (Leaflet path options, inline SVG) takes real
// colour values, not Tailwind class names.
export const BAND_COLORS = {
  LOW: '#2F6E3B',
  MEDIUM: '#7A5C0E',
  HIGH: '#A32E2E',
  NO_DATA: '#5A5F58',
};

export function bandRank(band) {
  const index = BAND_ORDER.indexOf(band);
  return index === -1 ? Infinity : index;
}

export function bandLabel(band) {
  return BAND_LABELS[band] ?? BAND_LABELS.NO_DATA;
}

export function bandAriaLabel(band, countPerMinute) {
  const { text, description } = bandLabel(band);
  if (band === 'NO_DATA' || countPerMinute == null) {
    return `${text}. ${description}.`;
  }
  return `${text}, ${countPerMinute} people per minute. ${description}.`;
}
