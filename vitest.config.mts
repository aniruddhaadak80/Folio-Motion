import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    /**
     * Every test file in the repository, wherever it lives.
     *
     * The patterns used to stop at `tests/**`, so the suites next to the code
     * they test - under `src/`, `lib/` and `scripts/` - were never picked up.
     * They were not failing; they were never run.
     *
     * `tests/vitest-config.test.ts` reads this list and fails if a test file
     * is added somewhere these patterns do not reach.
     */
    include: [
      "tests/**/*.test.ts",
      "tests/**/*.test.tsx",
      "src/**/__tests__/**/*.test.ts",
      "src/**/__tests__/**/*.test.tsx",
      "lib/**/__tests__/**/*.test.ts",
      "scripts/**/__tests__/**/*.test.mjs",
    ],
    // PGlite boots a full Postgres build in WebAssembly, which takes well over
    // the 10s default on Windows.
    hookTimeout: 120_000,
    testTimeout: 60_000,
    teardownTimeout: 60_000,
    pool: "forks",
    /**
     * Coverage reporting for `npm run test:coverage`.
     *
     * The provider is V8 because it measures the code that actually ran,
     * including the React components, without an extra instrumentation pass.
     */
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "lcov"],
      reportsDirectory: "coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["**/*.d.ts", "**/__tests__/**", "src/app/opengraph-image.tsx"],
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
