"use client";

import { useEffect, useState } from "react";

/**
 * Reactively tracks the `prefers-reduced-motion: reduce` media query.
 * Returns `true` on the server (SSR-safe: prefer the conservative default so
 * the first paint is the static fallback; the 3D scene only mounts after
 * hydration when the user has explicitly not requested reduced motion).
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(true);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReduced(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return prefersReduced;
}
