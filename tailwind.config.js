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
    },
  },
  plugins: [],
};
