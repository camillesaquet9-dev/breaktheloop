import type { Metadata, Viewport } from "next";
import { Nav } from "@/components/site/Nav";
import { TopBar } from "@/components/site/TopBar";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://breaktheloop.fr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BREAK THE LOOP — Arène Red Team IA",
    template: "%s · BREAK THE LOOP",
  },
  description:
    "Arène de red teaming IA. Fais sauter les défenses des modèles. Prompt injection, extraction système, défense, exploitation d'agents.",
  applicationName: "BREAK THE LOOP",
  keywords: [
    "prompt injection",
    "AI red team",
    "LLM security",
    "cybersécurité",
    "CTF IA",
    "HackAPrompt",
    "Gandalf Lakera",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "BREAK THE LOOP",
    title: "BREAK THE LOOP — Arène Red Team IA",
    description: "Probe · Exploit · Comprendre. Une arène de red teaming IA.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BREAK THE LOOP",
    description: "Arène de red teaming IA — prompt injection orientée cyber.",
  },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          Aller au contenu
        </a>
        <Nav />
        <TopBar />
        <div className="flex-1">{children}</div>
        <Toaster position="bottom-right" theme="dark" />
      </body>
    </html>
  );
}
