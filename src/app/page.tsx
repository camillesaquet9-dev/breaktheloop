/**
 * Placeholder landing — step 7 will replace this with the real Kill Chain
 * hero. For now, just a minimal hero + a design-system preview so we can
 * sanity-check the layout chrome (header, footer, skip link, toggle).
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  return (
    <main id="main-content" tabIndex={-1} className="flex-1 px-6 py-16 md:py-24">
      <div className="mx-auto w-full max-w-3xl space-y-16">
        <section aria-labelledby="hero-title" className="space-y-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            01 — Hero
          </p>
          <h1 id="hero-title" className="font-display text-5xl leading-[0.95] md:text-7xl">
            Break the loop.<span className="text-accent">_</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed">
            Camille Saquet — étudiant 3<sup>e</sup> année BUT R&amp;T cyber à Lannion, admis en
            alternance ESNA Ingénieur Cyberdéfense. Profil offense-forward : pentest, red team,
            audit. Certifié CSNA Stormshield, top mondial HackAPrompt.
          </p>
          <p className="font-mono text-sm text-muted-foreground">
            <span className="text-foreground">$</span> whoami → camille · alternance 3 ans cherchée
            · rentrée septembre 2026
          </p>
        </section>

        <section aria-labelledby="ui-preview" className="space-y-4">
          <p
            id="ui-preview"
            className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground"
          >
            02 — UI primitives preview
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
      </div>
    </main>
  );
}
