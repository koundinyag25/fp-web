import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

// Dev: proxy /api to the local backend so the app runs same-origin in dev too.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:8080", changeOrigin: true },
    },
  },
  build: { outDir: "dist" },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: false,
    coverage: {
      provider: "v8",
      all: true,
      reporter: ["text", "text-summary", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/main.tsx",
        "src/lib/queryClient.ts",
        "src/vite-env.d.ts",
        "src/**/*.d.ts",
        "src/**/index.ts",
        "src/test/**",
        "src/types/**",
        "src/**/*.test.{ts,tsx}",
      ],
      thresholds: { lines: 95, functions: 95, statements: 95, branches: 90 },
    },
  },
});
