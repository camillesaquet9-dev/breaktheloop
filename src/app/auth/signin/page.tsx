import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/supabase-server";
import { SignInForm } from "./signin-form";

export const metadata = {
  title: "Connexion",
  description: "Connecte-toi pour entrer dans l'arène.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const user = await getSessionUser();
  const params = await searchParams;
  if (user) redirect(params.next ?? "/arena");

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="max-w-[600px] mx-auto px-6 py-20"
    >
      <p
        className="font-mono text-xs uppercase mb-3"
        style={{ color: "var(--signal)", letterSpacing: "0.14em" }}
      >
        // ACCÈS · OPÉRATEUR
      </p>
      <h1
        className="font-display font-bold uppercase mb-3"
        style={{
          fontSize: "clamp(40px, 6vw, 72px)",
          letterSpacing: "-0.04em",
          lineHeight: 0.92,
        }}
      >
        Identifie-toi.
      </h1>
      <p className="text-sm mb-10" style={{ color: "var(--fg-dim)", lineHeight: 1.6 }}>
        Pas de mot de passe — un lien magique par email, ou ton compte Google. Ton handle est
        généré automatiquement, tu peux le changer plus tard.
      </p>

      <SignInForm next={params.next ?? "/arena"} initialError={params.error} />

      <p
        className="mt-10 pt-6 text-[11px]"
        style={{
          color: "var(--fg-mute)",
          borderTop: "1px solid var(--line)",
          lineHeight: 1.6,
        }}
      >
        En te connectant, tu acceptes que les attaques effectuées dans l&apos;arène soient
        loggées (hash de payload + IP saltée) à des fins de modération et d&apos;anti-triche.
        Aucun contenu n&apos;est partagé publiquement sans ton handle.
      </p>
    </main>
  );
}
