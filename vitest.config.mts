import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    env: {
      API_INTERNAL_URL: 'http://localhost:4000',
      NEXT_PUBLIC_API_URL: 'http://localhost:4000/api',
      NEXT_PUBLIC_APP_URL: 'https://buscatunido.vercel.app',
      NEXT_PUBLIC_CARTO_API_KEY: '',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
