"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { HeroTypographic } from "@/components/site/HeroTypographic";
import { buttonVariants } from "@/components/ui/button";
import { useHeroCapable } from "./useHeroCapable";

// Lazy-load the R3F canvas only on the client. `ssr: false` is required
// because three/R3F reach for `window`/`document` at module load, and we
// only want the ~180 kB gz bundle to ship when we'll actually mount it.
const HeroRoomScene = dynamic(() => import("./HeroRoomScene").then((m) => m.HeroRoomScene), {
  ssr: false,
  loading: () => null,
});

/**
 * The hero section controller.
 *
 * Renders either:
 *   - `<HeroTypographic/>` — SSR fallback, also shown pre-hydration and
 *     for any user who fails the capability gate.
 *   - `<HeroRoomScene/>` — the R3F 3D hacker-room experience, overlaid
 *     with an HTML copy layer (name + eyebrow + CTAs) so the page still
 *     reads as a portfolio hero, not a tech demo.
 *
 * Scroll progress is derived from the section's own getBoundingClientRect
 * and fed into a ref. We use rAF throttling — no IntersectionObserver —
 * so the CameraRig sees values every frame it's painted, no jitter.
 *
 * Pointer parallax is fed the same way (ref, not state) so React never
 * re-renders on mousemove.
 */
export function HeroRoom() {
  const capable = useHeroCapable();
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });

  // Mark mounted in an effect so the first client paint still matches the
  // SSR output — avoids a hydration flicker when capability comes back true.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll → progress [0..1] across the hero's on-screen travel. We compute
  // progress from `-top / height` clamped to [0,1] so 0 = fully in view at
  // top, 1 = fully scrolled past.
  useEffect(() => {
    if (!capable) return;
    const el = sectionRef.current;
    if (!el) return;

    let raf = 0;
    let scheduled = false;

    const tick = () => {
      scheduled = false;
      const rect = el.getBoundingClientRect();
      // Travel = section height minus one viewport, so progress reaches 1
      // exactly when the section's bottom aligns with the viewport bottom.
      const travel = Math.max(1, rect.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -rect.top / travel));
      progressRef.current = p;
    };

    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;
      raf = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [capable]);

  // Pointer → ref in [-1, 1] relative to the hero viewport.
  useEffect(() => {
    if (!capable) return;
    const el = sectionRef.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      pointerRef.current.x = Math.max(-1, Math.min(1, x));
      pointerRef.current.y = Math.max(-1, Math.min(1, y));
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [capable]);

  // Server / first paint / incapable → the static typographic hero.
  if (!mounted || capable !== true) {
    return <HeroTypographic />;
  }

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-title"
      className="relative mx-auto w-full max-w-[1400px] px-0"
    >
      {/* The 3D stage — 100dvh so the scroll-driven dolly has real travel. */}
      <div className="relative h-[100dvh] w-full">
        <Suspense fallback={null}>
          <HeroRoomScene progressRef={progressRef} pointerRef={pointerRef} />
        </Suspense>

        {/* Overlay copy — positioned absolute so it shares the stage with the
            canvas. Pointer-events pass through to hotspots except on the
            interactive bits themselves. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 md:p-10">
          <div className="flex items-start justify-between gap-6">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              01 — Hero · <span className="text-foreground">interactive</span>
            </p>
            <p className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:block">
              drag pointer · scroll to zoom
            </p>
          </div>

          <div className="max-w-2xl">
            <h1
              id="hero-title"
              className="font-display text-5xl leading-[0.9] tracking-tight md:text-7xl"
            >
              <span className="sr-only">Camille Saquet — cybersécurité offensive.</span>
              <span aria-hidden>
                offensive<span className="text-accent">.</span>
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-sm text-muted-foreground md:text-base">
              Étudiant cyber à Lannion — pentest, red team, audit. CSNA Stormshield, top mondial
              HackAPrompt. Explore la scène : cinq hotspots, cinq entrées.
            </p>
            <div className="pointer-events-auto mt-6 flex flex-wrap gap-3">
              <Link href="/projects" className={buttonVariants()}>
                Voir les projets
              </Link>
              <Link href="/contact" className={buttonVariants({ variant: "outline" })}>
                Me contacter
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* A small sentinel so the scroll progress has a realistic travel —
          scrolling one more viewport height takes `progress` from 0 → 1. */}
      <div aria-hidden className="h-[60vh]" />
    </section>
  );
}
