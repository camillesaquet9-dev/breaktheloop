"use client";

import { useEffect, useState } from "react";

/**
 * Gate that decides whether the heavy 3D hero should mount.
 *
 * The 3D scene is an experience enhancement, NOT a requirement — the
 * typographic fallback carries the full message and is SSR-rendered. We
 * only light up the R3F canvas when all the following hold:
 *
 *   - viewport ≥ 768px (md breakpoint — no cramped 3D on phones)
 *   - prefers-reduced-motion !== reduce
 *   - navigator.connection.saveData !== true
 *   - effectiveType not in {"slow-2g", "2g"}
 *   - deviceMemory (if exposed) ≥ 2
 *
 * Returns `null` while still deciding (pre-hydration), then `true|false`.
 * A null value means "keep rendering the SSR fallback" and the hydration
 * pass will not flip to 3D mid-frame.
 */
export function useHeroCapable(): boolean | null {
  const [capable, setCapable] = useState<boolean | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wideEnough = window.matchMedia("(min-width: 768px)").matches;

    type ConnectionLike = { saveData?: boolean; effectiveType?: string };
    const nav = navigator as Navigator & {
      connection?: ConnectionLike;
      deviceMemory?: number;
    };
    const saveData = nav.connection?.saveData === true;
    const slowNet = ["slow-2g", "2g"].includes(nav.connection?.effectiveType ?? "");
    const lowMem = typeof nav.deviceMemory === "number" && nav.deviceMemory < 2;

    setCapable(wideEnough && !reducedMotion && !saveData && !slowNet && !lowMem);
  }, []);

  return capable;
}
