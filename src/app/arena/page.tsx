import Link from "next/link";
import { getSessionUser } from "@/lib/auth/supabase-server";
import { getTutorialChallenges } from "@/lib/challenges/catalog";
import { challengeDef } from "@/lib/challenges/schema";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";

export const metadata = { title: "Arène · Tutoriel" };

export default async function ArenaPage() {
  const challenges = getTutorialChallenges().map((c) => challengeDef.parse(c));
  const user = await getSessionUser();

  // Solved-status per challenge for the connected user.
  let solved = new Set<string>();
  if (user) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("attempts")
      .select("challenge_slug, success")
      .eq("user_id", user.id)
      .eq("success", true);
    if (data) {
      solved = new Set(
        (data as Array<{ challenge_slug: string }>).map((r) => r.challenge_slug),
      );
    }
  }

  return (
    <main id="main-content" tabIndex={-1} className="max-w-[1280px] mx-auto px-6 py-12">
      <div className="flex items-end justify-between gap-6 mb-10">
        <div>
          <p
            className="font-mono text-xs uppercase mb-2"
            style={{ color: "var(--signal)", letterSpacing: "0.14em" }}
          >
            // ARÈNE · TUTORIEL
          </p>
          <h1
            className="font-display font-bold uppercase"
            style={{
              fontSize: "clamp(40px, 6vw, 80px)",
              letterSpacing: "-0.04em",
              lineHeight: 0.92,
            }}
          >
            10 challenges
            <br />
            à débloquer.
          </h1>
        </div>
        <div
          className="hidden md:block text-[11px] uppercase text-right"
          style={{ color: "var(--fg-dim)", letterSpacing: "0.1em" }}
        >
          PROGRESSION
          <br />
          <b style={{ color: "var(--fg)" }}>
            {solved.size} / {challenges.length}
          </b>
        </div>
      </div>

      {!user && (
        <div
          className="mb-10 p-5 flex items-center justify-between gap-4 flex-wrap"
          style={{ border: "1px solid var(--signal)", background: "rgba(255,80,40,0.04)" }}
        >
          <p className="text-sm" style={{ color: "var(--fg)" }}>
            Connecte-toi pour suivre ta progression et apparaître dans le classement.
          </p>
          <Link
            href={`/auth/signin?next=${encodeURIComponent("/arena")}`}
            className="px-3 py-2 text-xs uppercase font-medium border"
            style={{
              borderColor: "var(--signal)",
              color: "var(--fg)",
              letterSpacing: "0.08em",
            }}
          >
            &gt;_ ENTRER
          </Link>
        </div>
      )}

      <div
        className="grid grid-cols-1 md:grid-cols-2"
        style={{ border: "1px solid var(--line-2)" }}
      >
        {challenges.map((c, i) => {
          const isSolved = solved.has(c.slug);
          const isLastRow = i >= challenges.length - 2;
          const isLastCol = (i + 1) % 2 === 0;
          return (
            <Link
              key={c.slug}
              href={`/arena/${c.slug}`}
              className="block p-6 transition-colors hover:bg-[var(--bg-1)] group"
              style={{
                borderRight: isLastCol ? "none" : "1px solid var(--line-2)",
                borderBottom: isLastRow ? "none" : "1px solid var(--line-2)",
              }}
            >
              <div
                className="flex justify-between text-[10px] uppercase mb-3"
                style={{ color: "var(--fg-mute)", letterSpacing: "0.1em" }}
              >
                <span>{c.slug.replace(/^tuto-/, "CH·")}</span>
                <span style={{ color: isSolved ? "var(--safe)" : "var(--fg-mute)" }}>
                  {isSolved ? "● BREACHED" : "○ open"}
                </span>
              </div>
              <h2
                className="font-display font-bold uppercase mb-2 transition-colors group-hover:[color:var(--signal)]"
                style={{ fontSize: 26, letterSpacing: "-0.02em", lineHeight: 1.05 }}
              >
                {c.title}
              </h2>
              <p
                className="text-xs mt-3 mb-4"
                style={{ color: "var(--fg-dim)", lineHeight: 1.6 }}
              >
                {c.brief.slice(0, 160)}…
              </p>
              <div
                className="flex items-center justify-between text-[10px] uppercase pt-3"
                style={{
                  borderTop: "1px solid var(--line)",
                  color: "var(--fg-mute)",
                  letterSpacing: "0.1em",
                }}
              >
                <span>
                  TYPE :{" "}
                  <b style={{ color: "var(--fg-dim)" }}>
                    {c.type === "forbidden-phrase"
                      ? "phrase"
                      : c.type === "flag-extract"
                        ? "flag"
                        : "juges 3/3"}
                  </b>
                </span>
                <span>
                  DIFF{" "}
                  <span style={{ color: "var(--signal)" }}>
                    {"●".repeat(c.difficulty)}
                    <span style={{ color: "var(--line-2)" }}>
                      {"●".repeat(5 - c.difficulty)}
                    </span>
                  </span>
                </span>
                <span>
                  +<b style={{ color: "var(--fg-dim)" }}>{c.basePoints * c.difficulty}</b>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
