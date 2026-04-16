import type { Metadata, Viewport } from "next";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://breaktheloop.site"),
  title: {
    default: "Camille Saquet — breaktheloop.site",
    template: "%s — breaktheloop",
  },
  description:
    "Portfolio cybersécurité de Camille Saquet. Pentest, red team, audit. Étudiant BUT R&T cyber à Lannion, admis ESNA Ingénieur Cyberdéfense.",
  authors: [{ name: "Camille Saquet", url: "https://breaktheloop.site" }],
  creator: "Camille Saquet",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF7" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning className="h-full">
      <head>
        {/* Runs synchronously before first paint to set [data-theme]. No FOUC. */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static trusted string */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <a href="#main" className="skip-link">
          Passer au contenu principal
        </a>
        {children}
      </body>
    </html>
  );
}
