import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { IntroTypewriter } from "@/components/site/IntroTypewriter";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SkipLink } from "@/components/site/SkipLink";
import { Toaster } from "@/components/ui/sonner";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://breaktheloop.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Camille Saquet — cybersécurité · pentest · red team",
    template: "%s — Camille Saquet",
  },
  description:
    "Portfolio de Camille Saquet. Cybersécurité offensive — pentest, red team, audit. Étudiant BUT R&T cyber à Lannion, admis ESNA Ingénieur Cyberdéfense (alternance 2026).",
  authors: [{ name: "Camille Saquet", url: siteUrl }],
  creator: "Camille Saquet",
  applicationName: "Camille Saquet",
  keywords: [
    "Camille Saquet",
    "cybersecurity",
    "cybersécurité",
    "red team",
    "pentest",
    "audit",
    "HackAPrompt",
    "LLM security",
    "Stormshield",
    "alternance 2026",
    "ESNA cyberdéfense",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "Camille Saquet",
    title: "Camille Saquet — cybersécurité · pentest · red team",
    description:
      "Portfolio cybersécurité. Red team, pentest, audit. Alternance 3 ans en cyberdéfense — rentrée septembre 2026.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Camille Saquet — cybersécurité · pentest · red team",
    description: "Portfolio cybersécurité. Red team, pentest, audit.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF7" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
  colorScheme: "light dark",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // The middleware sets `x-nonce` on every request; read it here so we can
  // emit inline <script nonce="..."> tags compatible with our CSP. When the
  // middleware is bypassed (e.g. `next start` with matcher mismatch), the
  // nonce is undefined and the script simply runs without one — which is
  // fine in production because no CSP is attached to that response either.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="fr" suppressHydrationWarning className="h-full">
      <head>
        {/* Runs synchronously before first paint to set [data-theme]. Inline —
            NOT <Script> — so it executes before hydration and prevents FOUC.
            The nonce matches the per-request CSP value set in middleware.ts. */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static trusted string from our own module */}
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <IntroTypewriter />
        <SkipLink />
        <SiteHeader />
        {children}
        <SiteFooter />
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
