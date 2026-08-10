// Single source of truth for every colour value in the app. tailwind.config.js
// imports this for the theme; src/utils/bandLabels.js re-exports BAND_COLORS
// from here rather than duplicating hex values, and any component that needs
// a raw hex (Leaflet divIcon HTML strings, inline SVG) imports from here too.

export const INK = '#1F2A22';
export const PAPER = '#FAF8F3';
export const ACCENT = '#3F5A3D';
export const ACCENT_DARK = '#2C4029';

export const BAND_COLORS = {
  LOW: '#2F6E3B',
  MEDIUM: '#7A5C0E',
  HIGH: '#A32E2E',
  NO_DATA: '#5A5F58',
};

export const BAND_BG_COLORS = {
  LOW: '#E4F1E6',
  MEDIUM: '#FBF0D6',
  HIGH: '#F8E1E1',
  NO_DATA: '#ECEBE7',
};
