import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    // Node by default; component tests opt into jsdom via a per-file
    // `// @vitest-environment jsdom` pragma.
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
    globals: false,
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "json-summary", "html", "lcov"],
      reportsDirectory: "coverage",
      include: ["src/lib/**/*.{ts,tsx}"],
      exclude: ["src/lib/data/generated/**", "**/*.d.ts", "**/types.ts"],
      // Baseline guardrails set just below current coverage to prevent
      // regressions. Raise these as coverage improves.
      thresholds: {
        statements: 65,
        branches: 55,
        functions: 72,
        lines: 68,
      },
    },
  },
});
