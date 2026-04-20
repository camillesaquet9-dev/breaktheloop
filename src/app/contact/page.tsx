import type { Metadata } from "next";
import { ContactForm } from "@/components/site/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contacter Camille Saquet pour une proposition d'alternance 3 ans en cyberdéfense — rentrée septembre 2026.",
};

export default function ContactPage() {
  return (
    <main id="main-content" tabIndex={-1} className="flex-1">
      <section
        aria-labelledby="contact-title"
        className="mx-auto w-full max-w-3xl px-6 pt-16 pb-24 md:pt-24"
      >
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          — Contact
        </p>

        <h1 id="contact-title" className="mt-6 font-display text-5xl leading-[0.95] md:text-7xl">
          Prendre contact
        </h1>

        <p className="mt-6 max-w-2xl text-muted-foreground md:text-lg">
          Je cherche une alternance 3 ans en cyberdéfense (red team / pentest / SOC N2-N3) à partir
          de septembre 2026. Si vous recrutez — ou si vous voulez juste discuter d&apos;un sujet
          techno — l&apos;inbox est ouverte.
        </p>

        <div className="mt-10 border border-border p-6 md:p-8">
          <ContactForm />
        </div>

        <p className="mt-8 font-mono text-xs text-muted-foreground">
          Ce formulaire est protégé par un anti-bot Cloudflare Turnstile et limite à 3 envois par
          heure et par IP. Les IPs ne sont jamais stockées en clair — seulement un hash SHA-256
          salé. Les messages sont stockés dans une base avec RLS stricte et forward à mon inbox via
          Resend.
        </p>
      </section>
    </main>
  );
}
