import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  // The approved identity files live outside app/ and are read, never copied or changed.
  server: { host: "127.0.0.1", port: 5183, strictPort: true, fs: { allow: [".."] } },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
