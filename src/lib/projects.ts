import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { renderMarkdownToHtml } from "./markdown";

/**
 * Filesystem-backed project catalogue.
 *
 * Source of truth: `content/projects/*.md`. Each file has YAML front-matter
 * matching the `ProjectMeta` shape below, plus a Markdown body used for the
 * detail page.
 *
 * We resolve `content/` from the process cwd because `@/` only resolves
 * src/ paths. This is fine: Next.js always runs from the project root in
 * both dev and prod (build-time static generation + server runtime).
 */

export type ProjectStatus = "live" | "archived" | "redacted";

export type ProjectCategory =
  | "red-team"
  | "incident-response"
  | "audit"
  | "llm-security"
  | "research";

export type ProjectMeta = {
  readonly slug: string;
  readonly ordinal: string;
  readonly title: string;
  readonly tagline: string;
  readonly category: ProjectCategory;
  readonly status: ProjectStatus;
  readonly year: string;
  readonly stack: readonly string[];
  readonly featured: boolean;
  readonly role: string;
};

export type Project = ProjectMeta & {
  readonly body: string;
};

const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

/**
 * Memo per module load. Next.js bundles a fresh module per request in some
 * runtimes, but when it doesn't, we avoid re-reading the filesystem.
 */
let cache: readonly Project[] | null = null;

async function readProjectFile(filename: string): Promise<Project> {
  const filePath = path.join(PROJECTS_DIR, filename);
  const raw = await fs.readFile(filePath, "utf-8");
  const { data, content } = matter(raw);
  const meta = validateMeta(data, filename);
  return { ...meta, body: content };
}

function validateMeta(data: Record<string, unknown>, filename: string): ProjectMeta {
  const req = <T>(key: string, guard: (v: unknown) => v is T): T => {
    const v = data[key];
    if (!guard(v)) {
      throw new Error(`[projects] ${filename}: missing or invalid front-matter key "${key}"`);
    }
    return v;
  };
  const isString = (v: unknown): v is string => typeof v === "string";
  const isBool = (v: unknown): v is boolean => typeof v === "boolean";
  const isStringArray = (v: unknown): v is string[] =>
    Array.isArray(v) && v.every((x) => typeof x === "string");
  const isCategory = (v: unknown): v is ProjectCategory =>
    v === "red-team" ||
    v === "incident-response" ||
    v === "audit" ||
    v === "llm-security" ||
    v === "research";
  const isStatus = (v: unknown): v is ProjectStatus =>
    v === "live" || v === "archived" || v === "redacted";

  return {
    slug: req("slug", isString),
    ordinal: req("ordinal", isString),
    title: req("title", isString),
    tagline: req("tagline", isString),
    category: req("category", isCategory),
    status: req("status", isStatus),
    year: req("year", isString),
    featured: req("featured", isBool),
    role: req("role", isString),
    stack: req("stack", isStringArray),
  };
}

async function loadAll(): Promise<readonly Project[]> {
  if (cache) return cache;
  const entries = await fs.readdir(PROJECTS_DIR);
  const mdFiles = entries.filter((e) => e.endsWith(".md"));
  const projects = await Promise.all(mdFiles.map(readProjectFile));
  // Sort by ordinal (01, 02, …) for deterministic ordering.
  projects.sort((a, b) => a.ordinal.localeCompare(b.ordinal));
  cache = projects;
  return projects;
}

export async function getAllProjects(): Promise<readonly Project[]> {
  return loadAll();
}

export async function getFeaturedProjects(): Promise<readonly Project[]> {
  const all = await loadAll();
  return all.filter((p) => p.featured);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const all = await loadAll();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getProjectBodyHtml(slug: string): Promise<string | null> {
  const project = await getProjectBySlug(slug);
  if (!project) return null;
  return renderMarkdownToHtml(project.body);
}

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  "red-team": "Red Team",
  "incident-response": "Incident Response",
  audit: "Audit",
  "llm-security": "LLM Security",
  research: "Recherche",
};

export function labelForCategory(category: ProjectCategory): string {
  return CATEGORY_LABELS[category];
}
