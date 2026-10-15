import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 480_000,
  workers: 1, // CPU-rendered WebGL is heavy; parallel runs starve each other and time out
  use: {
    baseURL: 'http://localhost:4173',
    launchOptions: { args: ['--use-gl=angle', '--use-angle=swiftshader'] },
  },
  webServer: { command: 'npm run preview', port: 4173, reuseExistingServer: true, timeout: 60_000 },
  projects: [
    { name: 'desktop', use: { viewport: { width: 960, height: 600 } } },
    { name: 'phone', use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
    {
      name: 'phone-landscape',
      use: { viewport: { width: 667, height: 375 }, hasTouch: true, isMobile: true },
    },
  ],
});
