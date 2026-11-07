import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // Reads design/tokens.json and the generated token CSS without changing them.
  server: { port: 5184, strictPort: true, fs: { allow: ["../.."] } },
});
