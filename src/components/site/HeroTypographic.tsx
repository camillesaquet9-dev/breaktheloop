import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

/**
 * Typographic hero — the SSR-rendered source of truth.
 *
 * This fallback is shown to:
 *   - Users before hydration (no layout shift — same grid as the 3D hero),
 *   - Mobile viewports (< 768px),
 *   - prefers-reduced-motion users,
 *   - saveData / slow-2g / 2g users,
 *   - Low-memory devices (navigator.deviceMemory < 2),
 *   - Anyone with JS disabled (progressive enhancement ftw).
 *
 * It carries the full editorial load of the hero — visitors who never see
 * the 3D scene get the same message at full strength.
 *
 * Design notes:
 *   - Two-line monolithic name with negative letter-spacing, Instrument Serif.
 *   - Accent-red underscore cursor after SAQUET, matching the brand tell.
 *   - Monospace data column on the right, inspired by /etc/passwd editorial.
 *   - Background is deliberately plain so the page hero reads as a poster.
 */
export function HeroTypographic() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative mx-auto w-full max-w-6xl px-6 pt-16 pb-24 md:pt-24"
    >
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        01 — Hero
      </p>

      <h1
        id="hero-title"
        className="mt-6 font-display text-[clamp(3.25rem,13vw,12rem)] leading-[0.88] tracking-[-0.02em]"
      >
        <span className="block">CAMILLE</span>
        <span className="block">
          SAQUET<span className="text-accent">_</span>
        </span>
      </h1>

      <div className="mt-10 grid gap-10 md:grid-cols-[2fr_1fr] md:gap-16">
        <div className="space-y-6">
          <p className="max-w-xl text-base leading-relaxed md:text-lg">
            Étudiant 3<sup>e</sup> année BUT R&amp;T cybersécurité à Lannion, admis en alternance
            ESNA Ingénieur Cyberdéfense. Profil offense-forward :{" "}
            <strong className="font-semibold">pentest</strong>,{" "}
            <strong className="font-semibold">red team</strong>,{" "}
            <strong className="font-semibold">audit</strong>. Certifié CSNA Stormshield, top mondial
            HackAPrompt.
          </p>
          <p className="font-mono text-sm text-muted-foreground">
            <span className="text-foreground">$</span> whoami → camille · alternance 3 ans cherchée
            · rentrée septembre 2026
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/projects" className={buttonVariants()}>
              Voir les projets
            </Link>
            <Link href="/contact" className={buttonVariants({ variant: "outline" })}>
              Me contacter
            </Link>
          </div>
        </div>

        <div className="space-y-2 border-l border-border pl-6 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground md:pl-8">
          <p>
            <span className="text-foreground">Location</span> — Lannion, FR
          </p>
          <p>
            <span className="text-foreground">Status</span> — étudiant 3e année
          </p>
          <p>
            <span className="text-foreground">Cert.</span> — CSNA Stormshield
          </p>
          <p>
            <span className="text-foreground">Rank</span> — top mondial HackAPrompt
          </p>
          <p>
            <span className="text-foreground">Open to</span> — alternance 09/2026
          </p>
        </div>
      </div>
    </section>
  );
}
