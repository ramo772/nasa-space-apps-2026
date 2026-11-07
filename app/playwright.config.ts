import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90000,
  use: {
    baseURL: "http://127.0.0.1:5183",
    ...devices["Desktop Chrome"],
    // Software rendering by default. Set GAME_ANGLE=d3d11 to run on this machine's graphics hardware.
    launchOptions: { args: [`--use-angle=${process.env.GAME_ANGLE ?? "swiftshader"}`, "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] },
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1",
    url: "http://127.0.0.1:5183",
    reuseExistingServer: true,
  },
});

