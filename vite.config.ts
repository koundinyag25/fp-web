import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Dev: proxy /api to the local backend so the app runs same-origin in dev too.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:8080", changeOrigin: true },
    },
  },
  build: { outDir: "dist" },
});
