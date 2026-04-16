import { ShieldIcon } from "lucide-react";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * Placeholder landing — step 2 deliverable. Shows the three typefaces working,
 * the ivory/black palette, the sparing accent red, and the shadcn primitives.
 * Step 7 will replace this with the real Kill Chain hero.
 */
export default function Home() {
  return (
    <main id="main" className="flex-1 px-6 py-16 md:py-24">
      <div className="mx-auto w-full max-w-3xl space-y-16">
        <header className="flex items-start justify-between gap-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            00 — Design system preview
          </p>
          <ThemeToggle />
        </header>

        <section className="space-y-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            01 — Typography
          </p>
          <h1 className="font-display text-5xl md:text-7xl">
            Break the loop.<span className="text-accent">_</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed">
            Camille Saquet — étudiant 3<sup>e</sup> année BUT R&amp;T cyber à Lannion, admis en
            alternance ESNA Ingénieur Cyberdéfense. Profil offense-forward : pentest, red team,
            audit. Certifié CSNA Stormshield.
          </p>
          <p className="font-mono text-sm text-muted-foreground">
            <ShieldIcon className="mb-0.5 inline size-4" aria-hidden /> $ whoami → camille · top
            mondial HackAPrompt · alternance 3 ans cherchée
          </p>
        </section>

        <section className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            02 — UI primitives
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary CTA</Button>
            <Button variant="outline">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Critical</Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="email@example.com" aria-label="Email preview" />
            <Input placeholder="sujet" aria-label="Subject preview" />
          </div>
          <Textarea placeholder="message…" rows={3} aria-label="Message preview" />
        </section>

        <footer className="border-t pt-6 font-mono text-xs text-muted-foreground">
          <span className="text-foreground">[+]</span> bootstrap ok · step 2 complete
        </footer>
      </div>
    </main>
  );
}
