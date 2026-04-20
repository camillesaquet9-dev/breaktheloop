import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

/**
 * Global test setup — auto-cleanup between tests, jest-dom matchers.
 * Kept tiny so tests stay fast.
 */
afterEach(() => {
  cleanup();
});
