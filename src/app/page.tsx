import Link from "next/link";
import { KillChain } from "@/components/kill-chain/KillChain";
import { ProjectCard } from "@/components/site/ProjectCard";
import { buttonVariants } from "@/components/ui/button";
import { getFeaturedProjects } from "@/lib/projects";

/**
 * Landing page — sections:
 *   01 Hero (name + pitch + Kill Chain 3D)
 *   02 Selected work (3 featured projects)
 *   03 Contact CTA
 *
 * Server component; interactivity is confined to <KillChain/>.
 */
export default async function Home() {
  const featured = await getFeaturedProjects();

  return (
    <main id="main-content" tabIndex={-1} className="flex-1">
      {/* ============================================================
          01 — HERO
         ============================================================ */}
      <section
        aria-labelledby="hero-title"
        className="mx-auto w-full max-w-6xl px-6 pt-16 pb-24 md:pt-24"
      >
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          01 — Hero
        </p>

        <h1
          id="hero-title"
          className="mt-6 font-display text-5xl leading-[0.95] md:text-7xl lg:text-8xl"
        >
          Break the loop.<span className="text-accent">_</span>
        </h1>

        <div className="mt-10 grid gap-10 md:grid-cols-[2fr_1fr] md:gap-16">
          <div className="space-y-6">
            <p className="max-w-xl text-base leading-relaxed md:text-lg">
              Camille Saquet — étudiant 3<sup>e</sup> année BUT R&amp;T cybersécurité à Lannion,
              admis en alternance ESNA Ingénieur Cyberdéfense. Profil offense-forward :{" "}
              <strong className="font-semibold">pentest</strong>,{" "}
              <strong className="font-semibold">red team</strong>,{" "}
              <strong className="font-semibold">audit</strong>. Certifié CSNA Stormshield, top
              mondial HackAPrompt.
            </p>
            <p className="font-mono text-sm text-muted-foreground">
              <span className="text-foreground">$</span> whoami → camille · alternance 3 ans
              cherchée · rentrée septembre 2026
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

      {/* ============================================================
          02 — KILL CHAIN
         ============================================================ */}
      <section aria-labelledby="kill-chain-title" className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              02 — Méthodologie
            </p>
            <h2
              id="kill-chain-title"
              className="mt-3 font-display text-3xl leading-tight md:text-5xl"
            >
              Cyber Kill Chain
            </h2>
          </div>
          <p className="hidden max-w-xs text-sm text-muted-foreground md:block">
            Les sept étapes d&apos;une opération offensive — recon à impact. Cliquer sur une étape
            pour voir le détail.
          </p>
        </div>

        <KillChain />
      </section>

      {/* ============================================================
          03 — SELECTED WORK
         ============================================================ */}
      <section aria-labelledby="projects-title" className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              03 — Selected work
            </p>
            <h2
              id="projects-title"
              className="mt-3 font-display text-3xl leading-tight md:text-5xl"
            >
              Projets mis en avant
            </h2>
          </div>
          <Link
            href="/projects"
            className="hidden font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline md:inline"
          >
            Tous les projets →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>

        <div className="mt-8 md:hidden">
          <Link
            href="/projects"
            className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Tous les projets →
          </Link>
        </div>
      </section>

      {/* ============================================================
          04 — CONTACT CTA
         ============================================================ */}
      <section aria-labelledby="cta-title" className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="border border-border p-8 md:p-12">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            04 — Contact
          </p>
          <h2 id="cta-title" className="mt-3 font-display text-3xl leading-tight md:text-5xl">
            Une offre d&apos;alternance ?<span className="text-accent">_</span>
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Je cherche une alternance 3 ans en cyberdéfense (red team / pentest / SOC N2-N3). Mon
            inbox est ouverte — payload en .md, .pdf ou texte clair.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact" className={buttonVariants()}>
              Envoyer un message
            </Link>
            <a
              href="mailto:camille@breaktheloop.site"
              className={buttonVariants({ variant: "outline" })}
            >
              camille@breaktheloop.site
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
