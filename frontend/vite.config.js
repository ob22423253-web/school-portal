import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config. Dev server runs on 5173; production build outputs to dist/.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
});
