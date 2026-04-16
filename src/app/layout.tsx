import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://breaktheloop.site"),
  title: {
    default: "Camille Saquet — breaktheloop.site",
    template: "%s — breaktheloop",
  },
  description:
    "Portfolio cybersécurité de Camille Saquet. Pentest, red team, audit. Étudiant BUT R&T cyber à Lannion, admis ESNA Ingénieur Cyberdéfense.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={cn("h-full antialiased", "font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
