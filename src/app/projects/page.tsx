import type { Metadata } from "next";
import { ProjectCard } from "@/components/site/ProjectCard";
import { getAllProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projets",
  description:
    "Liste des projets de Camille Saquet : red team, incident response, audit, LLM security. Approche offense-forward.",
};

export default async function ProjectsIndex() {
  const projects = await getAllProjects();

  return (
    <main id="main-content" tabIndex={-1} className="flex-1">
      <section
        aria-labelledby="projects-index-title"
        className="mx-auto w-full max-w-6xl px-6 pt-16 pb-24 md:pt-24"
      >
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          — Index / Projects
        </p>

        <h1
          id="projects-index-title"
          className="mt-6 font-display text-5xl leading-[0.95] md:text-7xl"
        >
          Projets
        </h1>

        <p className="mt-6 max-w-2xl text-muted-foreground">
          Sélection d&apos;opérations offensives, investigations, audits et recherche LLM. Certains
          projets sont sous NDA — le contenu est rédigé côté méthodologie sans exposer de données
          client.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>
    </main>
  );
}
