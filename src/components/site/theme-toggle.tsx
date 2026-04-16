"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { STORAGE_KEY, type Theme } from "@/lib/theme";

/**
 * Switch [data-theme] on <html>, persist to localStorage, respect OS when
 * the user hasn't made an explicit choice yet.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  // Read whatever the pre-hydration script set on <html>.
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

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
      onClick={toggle}
    >
      {theme === "dark" ? (
        <SunIcon className="size-3.5" aria-hidden />
      ) : (
        <MoonIcon className="size-3.5" aria-hidden />
      )}
    </Button>
  );
}
