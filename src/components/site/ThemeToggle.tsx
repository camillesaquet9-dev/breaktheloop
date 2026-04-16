"use client";

import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEY, type Theme } from "@/lib/theme";

/**
 * Toggles [data-theme] on <html> and persists to localStorage.
 *
 * Icon: a 16×16 square, half filled / half empty. Rotating 180° on toggle
 * swaps which side is filled — a literal visual metaphor for dark/light
 * that sidesteps the sun/moon cliché. No Lucide import.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  // Pick up whatever the pre-hydration script set. `null` until mounted so
  // we don't render a wrong icon during SSR.
  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "dark" : "light");
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* quota / private mode — tolerate silently */
      }
      return next;
    });
  }, []);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      className="inline-flex size-8 items-center justify-center rounded-sm border border-transparent text-foreground transition-colors hover:border-border focus-visible:border-ring"
    >
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="size-4 transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{ transform: isDark ? "rotate(180deg)" : "rotate(0deg)" }}
      >
        <title>Theme toggle</title>
        {/* Outer square — stroke */}
        <rect
          x="1"
          y="1"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {/* Left half — filled */}
        <rect x="1" y="1" width="7" height="14" fill="currentColor" />
      </svg>
    </button>
  );
}
