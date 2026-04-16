import type { Metadata, Viewport } from "next";
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
    default: "Camille Saquet — breaktheloop.site",
    template: "%s — Camille Saquet",
  },
  description:
    "Portfolio cybersécurité de Camille Saquet. Pentest, red team, audit. Étudiant BUT R&T cyber à Lannion, admis ESNA Ingénieur Cyberdéfense.",
  authors: [{ name: "Camille Saquet", url: siteUrl }],
  creator: "Camille Saquet",
  applicationName: "breaktheloop",
  keywords: [
    "cybersecurity",
    "red team",
    "pentest",
    "audit",
    "HackAPrompt",
    "LLM security",
    "Stormshield",
    "portfolio",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "breaktheloop",
    title: "Camille Saquet — breaktheloop.site",
    description:
      "Portfolio cybersécurité. Red team, pentest, audit. Étudiant en alternance à la recherche d'un contrat 3 ans en cyberdéfense.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Camille Saquet — breaktheloop.site",
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning className="h-full">
      <head>
        {/* Runs synchronously before first paint to set [data-theme]. Inline —
            NOT <Script> — so it executes before hydration and prevents FOUC. */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static trusted string from our own module */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <SkipLink />
        <SiteHeader />
        {children}
        <SiteFooter />
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
