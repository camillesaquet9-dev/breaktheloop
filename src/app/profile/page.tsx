import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, getSessionUser } from "@/lib/auth/supabase-server";
import { getTutorialChallenges } from "@/lib/challenges/catalog";

export const metadata = { title: "Profil" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect(`/auth/signin?next=${encodeURIComponent("/profile")}`);

  const supabase = await createSupabaseServerClient();
  const [profileRes, attemptsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("attempts")
      .select("challenge_slug, success, score, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  const profile = profileRes.data as { handle: string } | null;
  const attempts =
    (attemptsRes.data as Array<{
      challenge_slug: string;
      success: boolean;
      score: number;
      created_at: string;
    }> | null) ?? [];

  const tutos = getTutorialChallenges();

  // Aggregate per-challenge best score for display.
  const bestByChallenge = new Map<string, number>();
  for (const a of attempts) {
    if (a.success) {
      bestByChallenge.set(
        a.challenge_slug,
        Math.max(bestByChallenge.get(a.challenge_slug) ?? 0, a.score),
      );
    }
  }
  const totalScore = Array.from(bestByChallenge.values()).reduce((s, v) => s + v, 0);
  const solvedCount = bestByChallenge.size;

  return (
    <main id="main-content" tabIndex={-1} className="max-w-[1280px] mx-auto px-6 py-12">
      <div className="flex items-end justify-between gap-6 mb-10 flex-wrap">
        <div className="flex items-center gap-6">
          <div
            className="w-22 h-22 grid place-items-center font-display font-bold relative overflow-hidden"
            style={{
              width: 88,
              height: 88,
              border: "1px solid var(--line-2)",
              background: "var(--bg-1)",
              fontSize: 34,
            }}
          >
            <div
              className="absolute -inset-1 pointer-events-none"
              style={{ border: "1px solid var(--signal)", opacity: 0.4 }}
            />
            {(profile?.handle ?? "OP").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p
              className="text-[10px] uppercase mb-1.5"
              style={{ color: "var(--fg-mute)", letterSpacing: "0.14em" }}
            >
              // TON PROFIL
            </p>
            <h1
              className="font-display font-bold uppercase"
              style={{ fontSize: 48, letterSpacing: "-0.03em", lineHeight: 1 }}
            >
              {profile?.handle ?? user.email?.split("@")[0] ?? "operator"}
            </h1>
            <p className="text-xs mt-1.5" style={{ color: "var(--fg-dim)", letterSpacing: "0.06em" }}>
              OPÉRATEUR · CLASS-{solvedCount >= 7 ? "III" : solvedCount >= 4 ? "II" : "I"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 mb-8"
        style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}
      >
        {[
          { l: "CHALLENGES RÉUSSIS", v: solvedCount, sub: `/ ${tutos.length}` },
          {
            l: "TAUX DE RÉUSSITE",
            v: attempts.length
              ? `${Math.round((attempts.filter((a) => a.success).length / attempts.length) * 100)}%`
              : "—",
            sub: "",
          },
          { l: "SCORE SIGNAL", v: totalScore.toLocaleString("fr-FR"), sub: "" },
          { l: "TENTATIVES TOTALES", v: attempts.length, sub: "(20 récentes)" },
        ].map((s, i) => (
          <div
            key={s.l}
            className="p-6"
            style={{ borderRight: i === 3 ? "none" : "1px solid var(--line)" }}
          >
            <p
              className="text-[10px] uppercase mb-3.5"
              style={{ color: "var(--fg-mute)", letterSpacing: "0.14em" }}
            >
              {s.l}
            </p>
            <p
              className="font-display font-bold tabular-nums"
              style={{ fontSize: 48, letterSpacing: "-0.04em", lineHeight: 0.9 }}
            >
              {s.v}
            </p>
            {s.sub && (
              <p className="text-xs mt-1.5" style={{ color: "var(--fg-mute)" }}>
                {s.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Activity */}
      <h2
        className="font-display font-bold uppercase mt-10 mb-2"
        style={{ fontSize: 28, letterSpacing: "-0.02em" }}
      >
        Activité récente
      </h2>
      <p className="text-xs mb-6" style={{ color: "var(--fg-dim)" }}>
        // tes 20 dernières interactions avec le système
      </p>
      {attempts.length > 0 ? (
        <div>
          {attempts.map((a, i) => (
            <div
              key={i}
              className="grid grid-cols-[80px_auto_1fr_80px_80px] gap-4 py-3 text-xs items-center"
              style={{ borderBottom: "1px solid var(--line)" }}
            >
              <div style={{ color: "var(--fg-mute)" }}>
                {new Date(a.created_at).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div
                className="px-2 py-0.5 text-[10px] uppercase border w-fit"
                style={{
                  borderColor: a.success ? "var(--safe)" : "var(--signal)",
                  color: a.success ? "var(--safe)" : "var(--signal)",
                  letterSpacing: "0.1em",
                }}
              >
                {a.success ? "BREACH" : "DENIED"}
              </div>
              <div style={{ color: "var(--fg)" }}>
                <Link
                  href={`/arena/${a.challenge_slug}`}
                  className="hover:[color:var(--signal)] transition-colors"
                >
                  {a.challenge_slug}
                </Link>
              </div>
              <div className="text-right tabular-nums" style={{ color: "var(--fg)" }}>
                +{a.score}
              </div>
              <div
                className="text-right text-[11px]"
                style={{ color: a.success ? "var(--safe)" : "var(--fg-dim)" }}
              >
                {a.success ? "● ok" : "−"}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm" style={{ color: "var(--fg-dim)" }}>
          Aucune tentative pour l&apos;instant. <Link href="/arena" style={{ color: "var(--signal)" }}>
            Lance ton premier challenge →
          </Link>
        </p>
      )}
    </main>
  );
}
