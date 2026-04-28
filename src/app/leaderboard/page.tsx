export default function LeaderboardPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="max-w-[1280px] mx-auto px-6 py-16"
    >
      <p
        className="font-mono text-xs uppercase mb-3"
        style={{ color: "var(--signal)", letterSpacing: "0.14em" }}
      >
        // CLASSEMENT · ALL-TIME
      </p>
      <h1
        className="font-display font-bold uppercase mb-6"
        style={{
          fontSize: "clamp(56px, 9vw, 120px)",
          letterSpacing: "-0.04em",
          lineHeight: 0.85,
        }}
      >
        Top
        <br />
        opérateurs<span style={{ color: "var(--signal)" }}>.</span>
      </h1>
      <p className="max-w-xl text-sm" style={{ color: "var(--fg-dim)", lineHeight: 1.5 }}>
        Certains utilisateurs ne font pas que jouer. <span style={{ color: "var(--signal)" }}>
        Ils cassent tout.</span> Les classements sont dérivés du taux de réussite,
        de l&apos;index de furtivité et du temps d&apos;exploitation.
      </p>

      <div
        className="mt-12 p-8 inline-block"
        style={{
          border: "1px dashed var(--line-2)",
          background: "var(--bg-1)",
          color: "var(--fg-dim)",
        }}
      >
        <code className="font-mono text-xs">
          status: AWAITING FIRST BREACH · ranking opens once 10+ operators registered.
        </code>
      </div>
    </main>
  );
}
