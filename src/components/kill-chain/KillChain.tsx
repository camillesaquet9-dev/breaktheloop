"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { KILL_CHAIN_STAGES } from "./data";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import { KillChainFallback } from "./KillChainFallback";

/**
 * Top-level Kill Chain component. Decides at runtime whether to mount the
 * 3D scene or render the static SVG:
 *
 *   - Server render: always the SVG (SSR-safe + no layout shift).
 *   - Client:
 *       * prefers-reduced-motion → keep the SVG forever.
 *       * otherwise → dynamically import the R3F scene once the section
 *         intersects the viewport (saves ~200kB on initial JS).
 *
 * The active stage is lifted to this component so the descriptive copy
 * stays in sync whether it's the 3D scene or (in a future iteration)
 * an interactive SVG.
 */

// Lazy-load Three.js / R3F so the initial landing bundle stays small.
const KillChainSceneLazy = dynamic(
  () => import("./KillChainScene").then((m) => ({ default: m.KillChainScene })),
  {
    ssr: false,
    loading: () => <KillChainFallback />,
  },
);

export function KillChain() {
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [prefersReduced]);

  const activeStage = useMemo(
    () => KILL_CHAIN_STAGES.find((s) => s.id === activeStageId) ?? null,
    [activeStageId],
  );

  const showScene = !prefersReduced && hasEntered;

  return (
    <div className="space-y-6">
      <div
        ref={containerRef}
        className="relative aspect-[16/7] w-full bg-muted/20 sm:aspect-[16/6]"
        aria-hidden={showScene ? "true" : undefined}
      >
        {showScene ? (
          <KillChainSceneLazy activeStageId={activeStageId} onStageChange={setActiveStageId} />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-6">
            <KillChainFallback />
          </div>
        )}
      </div>

      {/* Accessible descriptive copy + keyboard-operable stage list. The
          3D scene is an enhancement; the list is the canonical source of
          truth for screen readers and keyboard users. */}
      <div className="grid gap-3 font-mono text-xs sm:grid-cols-7">
        {KILL_CHAIN_STAGES.map((stage) => {
          const isActive = activeStageId === stage.id;
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => setActiveStageId(isActive ? null : stage.id)}
              aria-pressed={isActive}
              className={`flex flex-col items-start gap-1 border p-2 text-left transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isActive
                  ? "border-accent bg-accent/5 text-foreground"
                  : "border-border text-muted-foreground"
              }`}
            >
              <span className="text-[10px] uppercase tracking-[0.15em] opacity-60">
                {stage.ordinal}
              </span>
              <span className="text-foreground">{stage.short}</span>
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="min-h-[3rem] max-w-2xl text-sm text-muted-foreground">
        {activeStage ? (
          <>
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
              {activeStage.ordinal} — {activeStage.title}
            </span>
            <br />
            <span>{activeStage.tagline}</span>
          </>
        ) : (
          <span className="font-mono text-xs uppercase tracking-[0.18em] opacity-60">
            Sélectionnez une étape
          </span>
        )}
      </p>
    </div>
  );
}
