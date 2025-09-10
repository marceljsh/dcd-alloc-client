// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // Tentukan lingkungan pengujian
    environment: 'jsdom',
    // Tambahkan setup file untuk `jest-dom`
    setupFiles: './vitest.setup.js',
    globals: true,
    // Tentukan alias untuk path
    alias: {
      '@/': new URL('./src/', import.meta.url).pathname,
    },
  },
});