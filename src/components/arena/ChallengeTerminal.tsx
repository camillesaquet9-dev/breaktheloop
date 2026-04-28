"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import type { ChallengePublic } from "@/lib/challenges/schema";

type TerminalLine =
  | { kind: "sys"; text: string; ts: string }
  | { kind: "you"; text: string; ts: string }
  | { kind: "model"; text: string; ts: string; provider?: string }
  | { kind: "block"; tone: "success" | "fail"; title: string; text: string; ts: string };

const ts = () => {
  const d = new Date();
  const z = (n: number) => String(n).padStart(2, "0");
  return `${z(d.getUTCHours())}:${z(d.getUTCMinutes())}:${z(d.getUTCSeconds())}`;
};

export function ChallengeTerminal({ challenge }: { challenge: ChallengePublic }) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { kind: "sys", text: `Connexion établie. ${challenge.title}.`, ts: ts() },
    {
      kind: "sys",
      text:
        "Le système écoute. Soumets ton prompt — la réponse du modèle s'affichera ici. " +
        "Quand tu penses avoir réussi, clique sur SOUMETTRE.",
      ts: ts(),
    },
  ]);
  const [payload, setPayload] = useState("");
  const [flag, setFlag] = useState("");
  const [pending, setPending] = useState(false);
  const [solved, setSolved] = useState(false);
  const [stats, setStats] = useState<{ tokens: number; defenseTrips: number }>({
    tokens: 0,
    defenseTrips: 0,
  });
  const lastResponse = useRef<string>("");
  const termRef = useRef<HTMLDivElement>(null);

  const append = (l: TerminalLine) => {
    setLines((prev) => {
      const next = [...prev, l];
      // Auto-scroll on next paint.
      queueMicrotask(() => {
        termRef.current?.scrollTo({ top: termRef.current.scrollHeight, behavior: "smooth" });
      });
      return next;
    });
  };

  async function probe() {
    if (!payload.trim() || pending) return;
    const myPayload = payload;
    setPayload("");
    append({ kind: "you", text: myPayload, ts: ts() });
    setPending(true);

    try {
      const res = await fetch("/api/arena/probe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: challenge.slug, payload: myPayload }),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg =
          {
            AUTH_REQUIRED: "Tu dois te reconnecter.",
            CHALLENGE_NOT_FOUND: "Challenge introuvable.",
            PAYLOAD_TOO_LONG: `Trop long — max ${challenge.maxInputTokens} tokens.`,
            RATE_LIMITED: `Rate limit. Patiente ${json.retryAfterSeconds ?? "quelques"} sec.`,
            DAILY_QUOTA_REACHED: "Quota quotidien atteint (50 attempts/jour).",
            PROVIDER_UNAVAILABLE: "Tous les providers LLM saturés. Réessaie dans 1 min.",
          }[json.error as string] ?? `Erreur : ${json.error ?? "inconnue"}`;
        append({ kind: "block", tone: "fail", title: "ERREUR", text: msg, ts: ts() });
        return;
      }
      lastResponse.current = json.response ?? "";
      append({
        kind: "model",
        text: json.response ?? "(réponse vide)",
        provider: json.provider,
        ts: ts(),
      });
      setStats((s) => ({
        tokens: s.tokens + (json.inputTokens ?? 0) + (json.outputTokens ?? 0),
        defenseTrips: s.defenseTrips,
      }));
    } catch (err) {
      append({
        kind: "block",
        tone: "fail",
        title: "RÉSEAU",
        text: (err as Error).message,
        ts: ts(),
      });
    } finally {
      setPending(false);
    }
  }

  async function submit() {
    if (pending || solved) return;
    const submittedFlag = challenge.type === "flag-extract" ? flag.trim() : undefined;
    if (challenge.type === "flag-extract" && !submittedFlag) {
      toast.error("Saisis le flag avant de soumettre.");
      return;
    }
    const sourcePayload =
      challenge.type === "flag-extract"
        ? "(soumission flag)"
        : payload.trim() || lastResponse.current.slice(0, 80) || "(soumission)";

    setPending(true);
    try {
      const res = await fetch("/api/arena/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: challenge.slug,
          payload: sourcePayload,
          submittedFlag,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(`Erreur: ${json.error ?? "inconnue"}`);
        return;
      }
      if (json.success) {
        setSolved(true);
        append({
          kind: "block",
          tone: "success",
          title: `BREACH CONFIRMÉE · +${json.score} pts`,
          text: json.reason,
          ts: ts(),
        });
        toast.success(`Breach confirmée — +${json.score} pts`);
      } else {
        append({
          kind: "block",
          tone: "fail",
          title: "ÉCHEC DE LA TENTATIVE",
          text: json.reason,
          ts: ts(),
        });
        setStats((s) => ({ ...s, defenseTrips: s.defenseTrips + 1 }));
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {/* Title block */}
      <div
        className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-end pb-6 mb-6"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        <h1
          className="font-display font-bold uppercase"
          style={{ fontSize: "clamp(36px, 5vw, 64px)", letterSpacing: "-0.03em", lineHeight: 0.95 }}
        >
          {challenge.title}
        </h1>
        <div
          className="flex flex-col items-end gap-1.5 text-[11px] uppercase"
          style={{ color: "var(--fg-dim)", letterSpacing: "0.1em" }}
        >
          <div className="flex items-center gap-3">
            DIFFICULTÉ :
            <span className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <i
                  key={i}
                  className="block w-2 h-2"
                  style={{ background: i < challenge.difficulty ? "var(--signal)" : "var(--line-2)" }}
                />
              ))}
            </span>
          </div>
          <div className="tabular-nums" style={{ color: "var(--fg-mute)" }}>
            VECTEUR · {challenge.vector} · {challenge.basePoints * challenge.difficulty} pts max
          </div>
        </div>
      </div>

      {/* Body grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-[320px_1fr]"
        style={{ border: "1px solid var(--line)", minHeight: 680 }}
      >
        {/* Sidebar */}
        <aside
          className="p-6 flex flex-col gap-8"
          style={{ borderRight: "1px solid var(--line)", background: "var(--bg-1)" }}
        >
          <div>
            <h4
              className="text-[10px] uppercase mb-3 flex justify-between"
              style={{ color: "var(--fg-mute)", letterSpacing: "0.14em" }}
            >
              SYSTÈME <span style={{ color: "var(--signal)" }}>●</span>
            </h4>
            <p className="text-xs leading-[1.7]" style={{ color: "var(--fg-dim)" }}>
              {challenge.brief}
            </p>
          </div>

          <div>
            <h4
              className="text-[10px] uppercase mb-3"
              style={{ color: "var(--fg-mute)", letterSpacing: "0.14em" }}
            >
              OBJECTIF
            </h4>
            <div
              className="p-3.5 text-xs"
              style={{
                border: "1px solid var(--signal)",
                background: "rgba(255,80,40,0.04)",
                color: "var(--fg)",
                lineHeight: 1.6,
              }}
            >
              <b
                className="block text-[10px] mb-1.5 uppercase"
                style={{ color: "var(--signal)", letterSpacing: "0.14em", fontWeight: 500 }}
              >
                // PRIMAIRE
              </b>
              {challenge.objective}
            </div>
          </div>

          <div>
            <h4
              className="text-[10px] uppercase mb-3"
              style={{ color: "var(--fg-mute)", letterSpacing: "0.14em" }}
            >
              TÉLÉMÉTRIE
            </h4>
            <div className="flex flex-col gap-2 text-[11px]" style={{ color: "var(--fg-dim)" }}>
              <div className="flex justify-between">
                <span>Tokens cumulés</span>
                <span style={{ color: "var(--fg)" }}>{stats.tokens}</span>
              </div>
              <div className="flex justify-between">
                <span>Trips défense</span>
                <span style={{ color: "var(--signal)" }}>{stats.defenseTrips}</span>
              </div>
              <div className="flex justify-between">
                <span>État</span>
                <span style={{ color: solved ? "var(--safe)" : "var(--warn)" }}>
                  {solved ? "● BREACHED" : "○ probing"}
                </span>
              </div>
            </div>
          </div>

          {challenge.hasHint && stats.defenseTrips >= 3 && (
            <div
              className="p-3 text-[11px]"
              style={{
                border: "1px solid var(--warn)",
                background: "rgba(212,175,55,0.04)",
                color: "var(--fg-dim)",
              }}
            >
              💡 Indice débloqué — recharge la page pour le voir (à venir).
            </div>
          )}
        </aside>

        {/* Main */}
        <div className="flex flex-col">
          <div
            className="px-4 py-2.5 text-[10px] uppercase flex justify-between"
            style={{
              borderBottom: "1px solid var(--line)",
              color: "var(--fg-mute)",
              letterSpacing: "0.12em",
              background: "var(--bg-1)",
            }}
          >
            <span>// SORTIE SYSTÈME</span>
            <span className="flex items-center gap-2" style={{ color: "var(--safe)" }}>
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
                style={{ background: "var(--safe)" }}
              />
              TRACE EN DIRECT
            </span>
          </div>

          <div
            ref={termRef}
            className="flex-1 p-6 text-[13px] overflow-auto max-h-[480px]"
            style={{ background: "var(--bg)", color: "var(--fg-dim)", lineHeight: 1.7 }}
          >
            {lines.map((l, i) => {
              if (l.kind === "block") {
                const isSuccess = l.tone === "success";
                return (
                  <div
                    key={i}
                    className="my-3.5 p-3.5 text-xs"
                    style={{
                      borderLeft: `2px solid ${isSuccess ? "var(--safe)" : "var(--signal)"}`,
                      background: isSuccess
                        ? "rgba(120,200,140,0.04)"
                        : "rgba(255,80,40,0.04)",
                      color: "var(--fg)",
                    }}
                  >
                    <b
                      className="block uppercase text-[10px] mb-2"
                      style={{
                        color: isSuccess ? "var(--safe)" : "var(--signal)",
                        letterSpacing: "0.14em",
                      }}
                    >
                      {l.title}
                    </b>
                    {l.text}
                  </div>
                );
              }
              const pre =
                l.kind === "sys"
                  ? "SYS"
                  : l.kind === "you"
                    ? "VOUS"
                    : l.provider?.toUpperCase().slice(0, 4) ?? "MDL";
              const preColor =
                l.kind === "sys"
                  ? "var(--safe)"
                  : l.kind === "you"
                    ? "var(--fg)"
                    : "var(--signal)";
              const textColor = l.kind === "you" ? "var(--fg)" : "var(--fg-dim)";
              return (
                <div key={i} className="flex gap-3 mb-1.5">
                  <span
                    className="text-[11px] flex-shrink-0"
                    style={{ color: "var(--fg-mute)", minWidth: 60 }}
                  >
                    {l.ts}
                  </span>
                  <span
                    className="font-medium flex-shrink-0"
                    style={{ color: preColor, minWidth: 40 }}
                  >
                    {pre}
                  </span>
                  <span style={{ color: textColor, whiteSpace: "pre-wrap" }}>{l.text}</span>
                </div>
              );
            })}
            {pending && (
              <div className="flex gap-3 mb-1.5" style={{ color: "var(--fg-mute)" }}>
                <span style={{ minWidth: 60 }}>{ts()}</span>
                <span style={{ minWidth: 40 }}>...</span>
                <span className="animate-pulse-dot">le modèle réfléchit</span>
              </div>
            )}
          </div>

          {/* Input area */}
          <div
            className="grid"
            style={{
              borderTop: "1px solid var(--line)",
              background: "var(--bg-1)",
              gridTemplateColumns: "1fr auto",
            }}
          >
            <div className="flex items-start gap-3 px-4 py-3.5">
              <span
                className="font-medium pt-0.5"
                style={{ color: "var(--signal)" }}
              >
                &gt;_
              </span>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    probe();
                  }
                }}
                placeholder="Injecte ton prompt — Cmd/Ctrl+Enter pour envoyer."
                rows={2}
                disabled={pending || solved}
                className="flex-1 bg-transparent border-0 outline-none resize-none font-mono text-[13px] disabled:opacity-50"
                style={{ color: "var(--fg)", lineHeight: 1.6, minHeight: 44, maxHeight: 140 }}
              />
            </div>
            <button
              type="button"
              onClick={probe}
              disabled={pending || !payload.trim() || solved}
              className="px-6 text-[11px] uppercase font-medium transition-colors disabled:opacity-50 hover:!bg-[var(--signal)] hover:!text-[var(--bg)]"
              style={{
                borderLeft: "1px solid var(--line)",
                color: "var(--fg-dim)",
                background: "var(--bg-2)",
                letterSpacing: "0.12em",
              }}
            >
              ENVOYER ▸
            </button>
          </div>

          {/* Submit / Flag area */}
          <div
            className="flex items-center gap-3 px-4 py-3 flex-wrap"
            style={{ borderTop: "1px solid var(--line)", background: "var(--bg-1)" }}
          >
            {challenge.type === "flag-extract" && (
              <input
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                placeholder="FLAG{...}"
                disabled={solved}
                className="font-mono text-[13px] px-3 py-2 outline-none flex-1 min-w-[200px]"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--line-2)",
                  color: "var(--fg)",
                }}
              />
            )}
            <button
              type="button"
              onClick={submit}
              disabled={pending || solved}
              className="px-4 py-2 text-[11px] uppercase font-medium border transition-colors hover:!bg-[var(--signal)] hover:!text-[var(--bg)] disabled:opacity-40"
              style={{
                borderColor: "var(--signal)",
                color: "var(--fg)",
                background: "rgba(255,80,40,0.06)",
                letterSpacing: "0.12em",
              }}
            >
              {solved ? "BREACHED" : challenge.type === "flag-extract" ? "SOUMETTRE FLAG ▸" : "VALIDER LA TENTATIVE ▸"}
            </button>
            <span className="text-[10px] ml-auto" style={{ color: "var(--fg-mute)" }}>
              max {challenge.maxInputTokens} tok · 10 probes/h · 50 tentatives/jour
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
