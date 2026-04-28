import { createSupabaseServerClient } from "@/lib/auth/supabase-server";

export const metadata = { title: "Classement" };
export const dynamic = "force-dynamic";
export const revalidate = 60;

type Row = {
  user_id: string;
  handle: string;
  challenges_solved: number;
  total_score: number;
  last_breach: string | null;
};

export default async function LeaderboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("leaderboard_alltime")
    .select("*")
    .order("total_score", { ascending: false })
    .limit(100);

  const rows: Row[] = ((data as Row[] | null) ?? []).filter((r) => r.total_score > 0);

  return (
    <main id="main-content" tabIndex={-1} className="max-w-[1280px] mx-auto px-6 py-12">
      <p
        className="font-mono text-xs uppercase mb-3"
        style={{ color: "var(--signal)", letterSpacing: "0.14em" }}
      >
        // CLASSEMENT · ALL-TIME
      </p>
      <h1
        className="font-display font-bold uppercase mb-6"
        style={{ fontSize: "clamp(56px, 9vw, 120px)", letterSpacing: "-0.04em", lineHeight: 0.85 }}
      >
        Top
        <br />
        opérateurs<span style={{ color: "var(--signal)" }}>.</span>
      </h1>
      <p className="max-w-xl text-sm mb-12" style={{ color: "var(--fg-dim)", lineHeight: 1.5 }}>
        Classement par score signal cumulé (best-score par challenge × difficulté). Mise à jour
        toutes les minutes.
      </p>

      {rows.length === 0 ? (
        <div
          className="p-8 inline-block"
          style={{
            border: "1px dashed var(--line-2)",
            background: "var(--bg-1)",
            color: "var(--fg-dim)",
          }}
        >
          <code className="font-mono text-xs">
            status: AUCUN OPÉRATEUR CLASSÉ — sois le premier à breach un challenge.
          </code>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {["Rang", "Opérateur", "Score", "Challenges", "Dernière breach"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-3.5 text-[10px] uppercase font-medium ${i >= 2 ? "text-right" : "text-left"}`}
                    style={{
                      color: "var(--fg-mute)",
                      letterSpacing: "0.14em",
                      borderBottom: "1px solid var(--line-2)",
                      background: "var(--bg-1)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const rank = i + 1;
                return (
                  <tr
                    key={r.user_id}
                    className="hover:bg-[var(--bg-1)] transition-colors"
                    style={
                      rank <= 3
                        ? { background: "rgba(255,80,40,0.03)" }
                        : undefined
                    }
                  >
                    <td className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--line)" }}>
                      <span
                        className="font-display font-bold tabular-nums"
                        style={{
                          fontSize: rank === 1 ? 32 : rank <= 3 ? 26 : 24,
                          letterSpacing: "-0.02em",
                          color: rank === 1 ? "var(--signal)" : rank <= 3 ? "var(--fg)" : "var(--fg-mute)",
                        }}
                      >
                        {String(rank).padStart(2, "0")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--line)" }}>
                      <div className="flex items-center gap-3.5">
                        <span
                          className="grid place-items-center text-[11px] font-bold"
                          style={{
                            width: 28,
                            height: 28,
                            border: "1px solid var(--line-2)",
                            background: "var(--bg-2)",
                          }}
                        >
                          {r.handle.slice(0, 2).toUpperCase()}
                        </span>
                        <span style={{ color: "var(--fg)", fontWeight: 500 }}>@{r.handle}</span>
                      </div>
                    </td>
                    <td
                      className="px-4 py-3.5 text-right font-display font-bold tabular-nums"
                      style={{
                        borderBottom: "1px solid var(--line)",
                        fontSize: 20,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {r.total_score.toLocaleString("fr-FR")}
                    </td>
                    <td
                      className="px-4 py-3.5 text-right tabular-nums"
                      style={{ borderBottom: "1px solid var(--line)", color: "var(--fg-dim)" }}
                    >
                      {r.challenges_solved}
                    </td>
                    <td
                      className="px-4 py-3.5 text-right text-[11px]"
                      style={{ borderBottom: "1px solid var(--line)", color: "var(--fg-dim)" }}
                    >
                      {r.last_breach
                        ? new Date(r.last_breach).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                          })
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
