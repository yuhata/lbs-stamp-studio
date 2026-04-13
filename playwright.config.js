import { defineConfig } from '@playwright/test'

// stamp-studio のデフォルトVite dev serverは base path /stampiko-stamp-studio/ を使用。
// ポートは CI とローカルの競合を避けるため 5179 に固定。
const PORT = 5179
const BASE_PATH = '/stampiko-stamp-studio/'

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || `http://localhost:${PORT}${BASE_PATH}`,
    headless: true,
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}${BASE_PATH}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
})
