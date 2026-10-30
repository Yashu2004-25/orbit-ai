import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  // base: './' ensures assets load correctly inside Electron and Capacitor
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
});

