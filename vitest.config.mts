import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ['./vitest.setup.ts'],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    // PGlite boots a full Postgres build in WebAssembly, which takes well over
    // the 10s default on Windows.
    hookTimeout: 120_000,
    testTimeout: 60_000,
    teardownTimeout: 60_000,
    pool: "forks",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
