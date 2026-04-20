"use client";

import { Html } from "@react-three/drei";
import Link from "next/link";
import type { Hotspot } from "./hotspots";

/**
 * A numbered badge floating in 3D space. Uses drei's <Html> to project a
 * DOM element onto a world-space position — we get CSS styling, real links
 * (accessibility + SSR-ish) and pointer events without R3F raycasting.
 *
 * Badges:
 *   - Small circle with the ordinal (01..05), JetBrains Mono.
 *   - Expand on hover/focus to reveal the label (Projects, Contact, …).
 *   - Red accent ring on hover to raccord with the site's signature colour.
 *   - `distanceFactor` keeps the marker readable at any camera distance.
 *
 * Interactivity lives on the wrapper element (<Link>/<a>/<button>) so the
 * focus ring / click target is the real semantic control. The `group`
 * utility lets children react to hover/focus-visible in pure CSS — no JS
 * state, no a11y warnings about interactive <div>s.
 */
export function HotspotMarker({ hotspot }: { readonly hotspot: Hotspot }) {
  const body = (
    <span
      className={[
        "flex items-center gap-2 select-none",
        "rounded-full border border-border bg-background/90 backdrop-blur-sm",
        "px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground",
        "shadow-[0_1px_0_rgba(0,0,0,0.08)] transition-all duration-200",
        "group-hover:ring-2 group-hover:ring-accent group-hover:ring-offset-2 group-hover:ring-offset-background",
        "group-focus-visible:ring-2 group-focus-visible:ring-accent group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background",
      ].join(" ")}
    >
      <span className="text-accent">{hotspot.ordinal}</span>
      <span
        className={[
          "overflow-hidden transition-all duration-200",
          "max-w-0 opacity-0",
          "group-hover:max-w-[200px] group-hover:opacity-100",
          "group-focus-visible:max-w-[200px] group-focus-visible:opacity-100",
        ].join(" ")}
      >
        {hotspot.label}
      </span>
    </span>
  );

  return (
    <Html
      position={hotspot.position}
      center
      distanceFactor={6}
      style={{ pointerEvents: "auto" }}
      zIndexRange={[40, 0]}
    >
      {hotspot.kind === "route" ? (
        <Link
          href={hotspot.href}
          aria-label={`Navigate to ${hotspot.label}`}
          className="group inline-block outline-none"
        >
          {body}
        </Link>
      ) : hotspot.kind === "anchor" ? (
        <a
          href={hotspot.href}
          aria-label={`Jump to ${hotspot.label}`}
          className="group inline-block outline-none"
        >
          {body}
        </a>
      ) : (
        <button
          type="button"
          aria-label={`Easter egg — ${hotspot.id}`}
          className="group inline-block outline-none"
          onClick={() => {
            // Intentional developer console wink. The honeypot is the bot's
            // confession; this one's a hint for anyone who opens DevTools.
            // biome-ignore lint/suspicious/noConsole: intentional easter egg
            console.log(
              "%c☕ never trust a pentester who hasn't finished their coffee",
              "color:#8B1A1A;font-family:serif;font-size:14px;font-style:italic",
            );
          }}
        >
          {body}
        </button>
      )}
    </Html>
  );
}
