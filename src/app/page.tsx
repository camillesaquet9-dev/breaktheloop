import Link from "next/link";
import { HeroRoom } from "@/components/hero-room/HeroRoom";
import { KillChain } from "@/components/kill-chain/KillChain";
import { ProjectCard } from "@/components/site/ProjectCard";
import { buttonVariants } from "@/components/ui/button";
import { getFeaturedProjects } from "@/lib/projects";

/**
 * Landing page — sections:
 *   01 Hero (interactive 3D hacker-room + name takeover)
 *   02 Méthodologie — Cyber Kill Chain
 *   03 Selected work (3 featured projects)
 *   04 Contact CTA
 *
 * Server component; interactivity is confined to <HeroRoom/> and <KillChain/>.
 * HeroRoom self-decides whether to mount its R3F canvas or fall back to the
 * SSR typographic hero — no capability checks needed at this layer.
 */
export default async function Home() {
  const featured = await getFeaturedProjects();

  return (
    <main id="main-content" tabIndex={-1} className="flex-1">
      {/* ============================================================
          01 — HERO (interactive 3D room / typographic fallback)
         ============================================================ */}
      <HeroRoom />

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
