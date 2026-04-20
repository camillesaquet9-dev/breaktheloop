import Link from "next/link";
import { labelForCategory, type ProjectMeta } from "@/lib/projects";

/**
 * Landing/projects list card. Brutalist editorial — no images, pure
 * typographic hierarchy. Hover: accent underline on the title + shift
 * on the arrow glyph. No drop shadows, no rounded corners beyond the
 * global 2px.
 */
export function ProjectCard({ project }: { readonly project: ProjectMeta }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block border border-border p-6 transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {project.ordinal} — {labelForCategory(project.category)} · {project.year}
        </p>
        <span
          aria-hidden
          className="font-mono text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
        >
          →
        </span>
      </div>

      <h3 className="mt-3 font-display text-2xl leading-tight group-hover:underline group-hover:decoration-accent group-hover:underline-offset-4">
        {project.title}
      </h3>

      <p className="mt-2 text-sm text-muted-foreground">{project.tagline}</p>

      <p className="mt-6 text-sm">{project.role}</p>

      <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        {project.stack.slice(0, 4).map((tech) => (
          <li key={tech}>{tech}</li>
        ))}
        {project.stack.length > 4 && <li>+{project.stack.length - 4}</li>}
      </ul>

      {project.status === "redacted" && (
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
          [REDACTED — NDA]
        </p>
      )}
    </Link>
  );
}
