import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.js',
    globals: true,
    alias: {
      '@/': new URL('./src/', import.meta.url).pathname,
    },
  },
});