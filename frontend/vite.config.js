import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for the frontend.  React plugin is enabled by default.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});