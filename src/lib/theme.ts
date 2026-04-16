/**
 * Theme primitives — literal constants + the inline script that runs before
 * hydration to set [data-theme] on <html> from localStorage / prefers-color-scheme.
 *
 * Kept tiny and dependency-free so it can be injected as a <script> via Next's
 * `dangerouslySetInnerHTML` with no perceivable FOUC.
 */

export const STORAGE_KEY = "breaktheloop:theme";

export type Theme = "light" | "dark";

/** Inline script — runs synchronously in <head> before paint. No deps. */
export const themeInitScript = `
(function() {
  try {
    var key = "${STORAGE_KEY}";
    var stored = localStorage.getItem(key);
    var theme;
    if (stored === "light" || stored === "dark") {
      theme = stored;
    } else {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
`.trim();
