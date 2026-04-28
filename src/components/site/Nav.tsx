"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/", label: "[01] Accueil", match: (p: string) => p === "/" },
  { href: "/arena", label: "[02] Arène", match: (p: string) => p.startsWith("/arena") },
  { href: "/profile", label: "[03] Profil", match: (p: string) => p.startsWith("/profile") },
  {
    href: "/leaderboard",
    label: "[04] Classement",
    match: (p: string) => p.startsWith("/leaderboard"),
  },
];

export function Nav() {
  const pathname = usePathname();
  const [clock, setClock] = useState("00:00:00 UTC");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const fmt = (n: number) => String(n).padStart(2, "0");
      setClock(`${fmt(d.getUTCHours())}:${fmt(d.getUTCMinutes())}:${fmt(d.getUTCSeconds())} UTC`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      className="sticky top-0 z-[100] grid grid-cols-[auto_1fr_auto] items-center px-6 py-3.5 backdrop-blur-md text-xs"
      style={{
        background: "rgba(10,10,10,0.85)",
        borderBottom: "1px solid var(--line)",
        letterSpacing: "0.04em",
      }}
    >
      <Link href="/" className="flex items-center gap-2.5 font-bold">
        <span
          className="block w-2.5 h-2.5 animate-blink"
          style={{ background: "var(--signal)", boxShadow: "0 0 8px var(--signal)" }}
        />
        <span>
          BREAK<span style={{ color: "var(--signal)" }}>.</span>THE
          <span style={{ color: "var(--signal)" }}>.</span>LOOP
        </span>
        <span className="ml-2 font-normal" style={{ color: "var(--fg-mute)" }}>
          v0.1.0
        </span>
      </Link>

      <nav className="flex justify-center gap-0.5">
        {LINKS.map((l) => {
          const active = l.match(pathname);
          return (
            <Link
              key={l.href}
              href={l.href}
              className="px-3.5 py-1.5 uppercase border transition-colors"
              style={{
                color: active ? "var(--fg)" : "var(--fg-dim)",
                borderColor: active ? "var(--fg)" : "transparent",
                background: active ? "var(--bg-2)" : "transparent",
              }}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div
        className="flex items-center gap-3.5 text-[11px]"
        style={{ color: "var(--fg-dim)" }}
      >
        <span className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
            style={{ background: "var(--safe)", boxShadow: "0 0 6px var(--safe)" }}
          />
          ARÈNE EN LIGNE
        </span>
        <span suppressHydrationWarning>{clock}</span>
      </div>
    </header>
  );
}
