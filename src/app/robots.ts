import type { MetadataRoute } from "next";

/**
 * robots.txt — allow everything indexable, block API + Next internals, point
 * crawlers at the dynamic sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://breaktheloop.site";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
