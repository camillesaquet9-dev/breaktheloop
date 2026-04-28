import { notFound, redirect } from "next/navigation";
import { ChallengeTerminal } from "@/components/arena/ChallengeTerminal";
import { isGuestMode } from "@/lib/auth/guest-mode";
import { getSessionUser } from "@/lib/auth/supabase-server";
import { getChallenge } from "@/lib/challenges/catalog";
import { challengeDef, toPublic } from "@/lib/challenges/schema";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getChallenge(slug);
  return { title: c?.title ?? "Challenge introuvable" };
}

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const def = getChallenge(slug);
  if (!def) notFound();
  const challenge = challengeDef.parse(def);

  const guest = isGuestMode();
  const user = guest ? null : await getSessionUser();
  if (!guest && !user) {
    redirect(`/auth/signin?next=${encodeURIComponent(`/arena/${slug}`)}`);
  }

  return (
    <main id="main-content" tabIndex={-1} className="max-w-[1280px] mx-auto px-6 py-8">
      <p className="text-[11px] uppercase mb-4" style={{ color: "var(--fg-dim)", letterSpacing: "0.1em" }}>
        <span>arène</span> &nbsp;/&nbsp;{" "}
        <span style={{ color: "var(--fg-mute)" }}>{challenge.vector}</span> &nbsp;/&nbsp;{" "}
        <b style={{ color: "var(--signal)", fontWeight: 500 }}>{challenge.slug}</b>
      </p>

      {guest && <GuestBanner />}

      <ChallengeTerminal challenge={toPublic(challenge)} />
    </main>
  );
}

function GuestBanner() {
  return (
    <div
      className="mb-4 p-3 text-xs flex items-center justify-between gap-3"
      style={{
        border: "1px solid var(--warn)",
        background: "rgba(212,175,55,0.06)",
        color: "var(--fg)",
      }}
    >
      <span>
        <b style={{ color: "var(--warn)", letterSpacing: "0.1em" }}>// MODE INVITÉ ·</b> Tes
        scores ne sont pas sauvegardés. Auth temporairement désactivée pour tester les
        challenges.
      </span>
    </div>
  );
}
