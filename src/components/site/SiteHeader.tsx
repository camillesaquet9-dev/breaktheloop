"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { ThemeToggle } from "@/components/site/ThemeToggle";

const NAV_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  // Lock body scroll + listen for Escape while the mobile overlay is open.
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header
      className="sticky top-0 z-40 w-full border-b backdrop-blur-md"
      style={{
        backgroundColor: "color-mix(in srgb, var(--background) 80%, transparent)",
      }}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-6 px-6">
        {/* Logo — Camille Saquet wordmark + discreet codename */}
        <Link
          href="/"
          className="group flex items-baseline gap-2 text-foreground transition-opacity hover:opacity-70 focus-visible:opacity-70"
          aria-label="Camille Saquet — home"
        >
          <span className="font-display text-lg leading-none tracking-tight">Camille Saquet</span>
          <span
            className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:inline"
            aria-hidden
          >
            / breaktheloop
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="relative font-sans text-sm text-foreground/80 transition-colors hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-current after:transition-all after:duration-150 hover:after:w-full motion-reduce:hover:after:w-0"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Mobile burger */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="inline-flex size-8 items-center justify-center rounded-sm border border-transparent text-foreground transition-colors hover:border-border focus-visible:border-ring md:hidden"
          >
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <title>Menu icon</title>
              {menuOpen ? (
                <>
                  <line x1="3" y1="3" x2="13" y2="13" />
                  <line x1="13" y1="3" x2="3" y2="13" />
                </>
              ) : (
                <>
                  <line x1="2" y1="5" x2="14" y2="5" />
                  <line x1="2" y1="11" x2="14" y2="11" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile fullscreen overlay */}
      {menuOpen && (
        <div
          id={menuId}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="fixed inset-0 top-14 z-30 flex flex-col bg-background md:hidden"
        >
          <nav aria-label="Primary mobile" className="flex-1 overflow-y-auto">
            <ul className="flex flex-col gap-6 px-6 py-10">
              {NAV_LINKS.map((link, index) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block font-display text-6xl leading-[0.95] tracking-tight text-foreground transition-opacity hover:opacity-60 focus-visible:opacity-60"
                  >
                    <span
                      className="mr-3 align-top font-mono text-xs text-muted-foreground"
                      aria-hidden
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t px-6 py-4 font-mono text-xs text-muted-foreground">
            <span className="text-foreground">$</span> esc · tap link to close
          </div>
        </div>
      )}
    </header>
  );
}
