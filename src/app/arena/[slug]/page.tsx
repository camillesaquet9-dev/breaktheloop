import { notFound, redirect } from "next/navigation";
import { ChallengeTerminal } from "@/components/arena/ChallengeTerminal";
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

  const user = await getSessionUser();
  if (!user) redirect(`/auth/signin?next=${encodeURIComponent(`/arena/${slug}`)}`);

  return (
    <main id="main-content" tabIndex={-1} className="max-w-[1280px] mx-auto px-6 py-8">
      <p className="text-[11px] uppercase mb-4" style={{ color: "var(--fg-dim)", letterSpacing: "0.1em" }}>
        <span>arène</span> &nbsp;/&nbsp;{" "}
        <span style={{ color: "var(--fg-mute)" }}>{challenge.vector}</span> &nbsp;/&nbsp;{" "}
        <b style={{ color: "var(--signal)", fontWeight: 500 }}>{challenge.slug}</b>
      </p>

      <ChallengeTerminal challenge={toPublic(challenge)} />
    </main>
  );
}
