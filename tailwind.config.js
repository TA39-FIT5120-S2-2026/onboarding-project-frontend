import { INK, PAPER, ACCENT, ACCENT_DARK, BAND_COLORS, BAND_BG_COLORS } from './src/theme/colors.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: INK,
        paper: PAPER,
        accent: {
          DEFAULT: ACCENT,
          dark: ACCENT_DARK,
        },
        band: {
          low: BAND_COLORS.LOW,
          lowBg: BAND_BG_COLORS.LOW,
          medium: BAND_COLORS.MEDIUM,
          mediumBg: BAND_BG_COLORS.MEDIUM,
          high: BAND_COLORS.HIGH,
          highBg: BAND_BG_COLORS.HIGH,
          noData: BAND_COLORS.NO_DATA,
          noDataBg: BAND_BG_COLORS.NO_DATA,
        },
      },
      // A single named scale, used consistently instead of ad hoc text-sm/
      // text-lg picks per component - the fix for pages that each ended up
      // with a slightly different type rhythm.
      fontSize: {
        display: ['2.5rem', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.01em' }],
        'display-sm': ['2rem', { lineHeight: '1.15', fontWeight: '700', letterSpacing: '-0.01em' }],
        heading: ['1.5rem', { lineHeight: '1.25', fontWeight: '600' }],
        'heading-sm': ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.6' }],
        caption: ['0.9375rem', { lineHeight: '1.5' }],
        micro: ['0.8125rem', { lineHeight: '1.4' }],
      },
    },
  },
  plugins: [],
};
