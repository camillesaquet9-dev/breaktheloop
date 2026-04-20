import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllProjects,
  getProjectBodyHtml,
  getProjectBySlug,
  labelForCategory,
} from "@/lib/projects";

type PageProps = {
  readonly params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Projet introuvable" };
  return {
    title: project.title,
    description: project.tagline,
    openGraph: {
      title: project.title,
      description: project.tagline,
      type: "article",
    },
  };
}

export default async function ProjectDetail({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const html = await getProjectBodyHtml(slug);

  return (
    <main id="main-content" tabIndex={-1} className="flex-1">
      <article className="mx-auto w-full max-w-3xl px-6 pt-16 pb-24 md:pt-24">
        <Link
          href="/projects"
          className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          ← Index / Projects
        </Link>

        <header className="mt-10 border-b border-border pb-10">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {project.ordinal} — {labelForCategory(project.category)} · {project.year}
          </p>

          <h1 className="mt-6 font-display text-4xl leading-[0.95] md:text-6xl">{project.title}</h1>

          <p className="mt-6 max-w-2xl text-muted-foreground md:text-lg">{project.tagline}</p>

          <dl className="mt-8 grid gap-6 font-mono text-xs uppercase tracking-[0.15em] sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Rôle</dt>
              <dd className="mt-1 normal-case tracking-normal text-foreground">{project.role}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Statut</dt>
              <dd className="mt-1 text-foreground">
                {project.status === "redacted" ? (
                  <span className="text-accent">[REDACTED — NDA]</span>
                ) : (
                  project.status
                )}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Stack</dt>
              <dd className="mt-1 flex flex-wrap gap-x-2 gap-y-1 normal-case tracking-wide text-foreground">
                {project.stack.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </dd>
            </div>
          </dl>
        </header>

        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is produced by a sanitising unified/rehype pipeline (rehype-sanitize with explicit schema) in src/lib/markdown.ts */}
        <div className="project-prose mt-10" dangerouslySetInnerHTML={{ __html: html ?? "" }} />
      </article>
    </main>
  );
}
