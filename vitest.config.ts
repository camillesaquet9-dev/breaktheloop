import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Vitest config — unit + component tests.
 *
 * - JSDOM environment for React component tests.
 * - Node env tests opt-in via `// @vitest-environment node` in the file.
 * - e2e lives under `tests/e2e/**` (Playwright) and is excluded here.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // The real `server-only` package throws on import unless the loader
      // is RSC-aware. In vitest we're just unit-testing pure logic — stub
      // it out so modules annotated with `import "server-only"` are loadable.
      "server-only": path.resolve(__dirname, "./tests/stubs/server-only.ts"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "tests/e2e/**"],
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/lib/**/*.ts"],
      exclude: ["src/lib/**/*.test.ts", "src/lib/supabase/database.types.ts"],
    },
  },
});
