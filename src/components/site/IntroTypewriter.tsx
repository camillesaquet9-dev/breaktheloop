"use client";

import { useEffect, useState } from "react";

/**
 * One-shot intro overlay.
 *
 * Behaviour:
 *   1. Mounts returning null on the server + during hydration, so SSR HTML
 *      never shows the overlay (prevents hydration mismatch).
 *   2. After hydration, checks three gates in order:
 *        a. prefers-reduced-motion → never play.
 *        b. localStorage flag `INTRO_KEY` is set → never play.
 *        c. document.visibilityState === 'hidden' → never play (prerender,
 *           background tab, tab re-focused from another page).
 *      If any gate fails, we bail silently (no overlay flash).
 *   3. Plays the typewriter for ~2.8s, fades out over 400ms, unmounts at 3.2s.
 *   4. Any user interaction (click/keydown/touch) skips straight to the
 *      fade-out phase — never trap the user.
 *
 * The overlay is rendered as a `<dialog>` at z-index 100, above the header.
 * It uses a CSS animation (not JS keyframes) for the caret so the motion
 * stays smooth even under main-thread pressure from the Kill Chain scene.
 */

const INTRO_KEY = "breaktheloop:intro-seen";
const FULL_TEXT = "break_the_loop.";
const TYPE_DURATION_MS = 1800; // total typing time
const HOLD_MS = 800; // time to display full text before fade
const FADE_MS = 400;

type Phase = "typing" | "holding" | "fading" | "done";

export function IntroTypewriter() {
  const [mounted, setMounted] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");

  // Gate 1: only mount after hydration so SSR HTML stays stable.
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Gate 2: reduced motion — skip entirely.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      markAsSeen();
      return;
    }

    // Gate 3: already seen this session / forever.
    try {
      if (localStorage.getItem(INTRO_KEY) === "1") return;
    } catch {
      // localStorage unavailable (private mode, quota) — play once, don't
      // persist. Cheaper than failing silently.
    }

    // Gate 4: page is backgrounded (user arrived from a link in another
    // tab and immediately switched away). Skip so we don't play a stale
    // overlay when they return.
    if (document.visibilityState === "hidden") return;

    setShouldPlay(true);
  }, [mounted]);

  // Typewriter: increment `typed` deterministically based on elapsed time.
  useEffect(() => {
    if (!shouldPlay || phase !== "typing") return;

    const start = performance.now();
    let rafId = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / TYPE_DURATION_MS);
      const chars = Math.round(progress * FULL_TEXT.length);
      setTyped(FULL_TEXT.slice(0, chars));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setPhase("holding");
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [shouldPlay, phase]);

  // Hold → fade → done.
  useEffect(() => {
    if (phase === "holding") {
      const id = window.setTimeout(() => setPhase("fading"), HOLD_MS);
      return () => window.clearTimeout(id);
    }
    if (phase === "fading") {
      const id = window.setTimeout(() => {
        setPhase("done");
        markAsSeen();
      }, FADE_MS);
      return () => window.clearTimeout(id);
    }
  }, [phase]);

  // Any interaction jumps straight to fade-out.
  useEffect(() => {
    if (!shouldPlay || phase === "done") return;
    const skip = () => {
      setTyped(FULL_TEXT);
      setPhase("fading");
    };
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("click", skip, { once: true });
    window.addEventListener("touchstart", skip, { once: true, passive: true });
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("click", skip);
      window.removeEventListener("touchstart", skip);
    };
  }, [shouldPlay, phase]);

  if (!shouldPlay || phase === "done") return null;

  const opacity = phase === "fading" ? 0 : 1;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background font-mono text-3xl tracking-[-0.02em] text-foreground sm:text-5xl md:text-6xl"
      style={{
        opacity,
        transition: `opacity ${FADE_MS}ms ease-out`,
      }}
    >
      <span>
        {typed}
        <span className="inline-block w-[0.55ch] animate-blink text-accent">_</span>
      </span>
    </div>
  );
}

function markAsSeen() {
  try {
    localStorage.setItem(INTRO_KEY, "1");
  } catch {
    // no-op: localStorage blocked; the intro will replay next visit.
  }
}
