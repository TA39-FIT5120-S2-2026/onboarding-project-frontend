import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.jsx'],
    globals: true,
    env: {
      VITE_USE_FIXTURES: 'true',
      VITE_API_BASE_URL: 'http://localhost:3000',
    },
  },
});
