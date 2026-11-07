import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  // The approved identity files live outside app/ and are read, never copied or changed.
  server: {
    host: "127.0.0.1",
    port: 5183,
    strictPort: true,
    fs: { allow: [".."] },
    // Wait until a save has finished. Reading mid-save once cached an empty module and broke the 3D scene.
    watch: { awaitWriteFinish: { stabilityThreshold: 150, pollInterval: 40 } },
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
