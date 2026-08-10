/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1F2A22',
        paper: '#FAF8F3',
        accent: {
          DEFAULT: '#3F5A3D',
          dark: '#2C4029',
        },
        band: {
          low: '#2F6E3B',
          lowBg: '#E4F1E6',
          medium: '#7A5C0E',
          mediumBg: '#FBF0D6',
          high: '#A32E2E',
          highBg: '#F8E1E1',
          noData: '#5A5F58',
          noDataBg: '#ECEBE7',
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
