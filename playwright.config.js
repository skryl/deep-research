const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:1313',
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH || '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome',
    },
  },
  webServer: {
    command: 'bash scripts/build-content.sh && hugo server --bind 0.0.0.0 --port 1313 --baseURL http://localhost:1313/',
    port: 1313,
    reuseExistingServer: true,
    timeout: 15000,
  },
  projects: [
    {
      name: 'desktop',
      use: { viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'mobile',
      use: { viewport: { width: 375, height: 812 } },
    },
  ],
});
