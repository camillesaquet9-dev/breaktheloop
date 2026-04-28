/**
 * Arena hub — list of 10 tutorial challenges + access to daily challenge.
 * Coming next: pulls from challenges table once schema is migrated.
 */
export default function ArenaPage() {
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
        // ARÈNE · TUTORIEL
      </p>
      <h1
        className="font-display font-bold uppercase mb-6"
        style={{
          fontSize: "clamp(48px, 7vw, 96px)",
          letterSpacing: "-0.04em",
          lineHeight: 0.9,
        }}
      >
        10 challenges
        <br />
        à débloquer.
      </h1>
      <p className="max-w-xl text-sm" style={{ color: "var(--fg-dim)", lineHeight: 1.6 }}>
        L&apos;arène est en cours de calibration. Les challenges arrivent en streaming —
        revient dans quelques jours pour la première salve.
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
          status: BUILDING · ETA: see daily console at /
        </code>
      </div>
    </main>
  );
}
