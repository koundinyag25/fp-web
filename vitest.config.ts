import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      // http.ts is a bare axios.create config (no logic) — excluded from the
      // unit surface. Components/hooks land here as those test layers grow.
      include: ["src/utils/date.ts", "src/utils/sse.ts", "src/config/filters.ts"],
    },
  },
});
