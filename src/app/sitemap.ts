import type { MetadataRoute } from "next";
import { getAllProjects } from "@/lib/projects";

/**
 * Dynamic sitemap — regenerated on every build. Static routes are hard-coded;
 * project detail pages are derived from the Markdown content directory so
 * adding a new project file automatically lights it up in the sitemap.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://breaktheloop.site";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
  ];

  const projects = await getAllProjects();
  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${siteUrl}/projects/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: p.featured ? 0.85 : 0.6,
  }));

  return [...staticRoutes, ...projectRoutes];
}
