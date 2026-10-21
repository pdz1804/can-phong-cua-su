import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: { target: 'es2022', chunkSizeWarningLimit: 900, assetsInlineLimit: 0 },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      reporter: ['text-summary', 'json-summary', 'lcov', 'html'],
      // a ratchet, not a target: the scene code is covered by the browser walkthrough instead
      thresholds: { lines: 13, functions: 22, branches: 60 },
    },
  },
} as never);
