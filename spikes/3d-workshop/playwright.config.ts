import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  timeout: 60000,
  use: {
    baseURL: "http://127.0.0.1:5184",
    ...devices["Desktop Chrome"],
    // Software rendering by default. Set SPIKE_ANGLE=d3d11 to measure on this machine's graphics hardware.
    launchOptions: { args: [`--use-angle=${process.env.SPIKE_ANGLE ?? "swiftshader"}`, "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] },
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1",
    url: "http://127.0.0.1:5184",
    reuseExistingServer: true,
  },
});
