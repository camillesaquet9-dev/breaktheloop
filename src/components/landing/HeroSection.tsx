import Link from "next/link";

export function HeroSection() {
  return (
    <section
      className="relative pt-14 pb-12 overflow-hidden"
      style={{
        borderBottom: "1px solid var(--line)",
        background:
          "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.012) 50%, transparent 100%), var(--bg)",
      }}
    >
      <div className="hero-grid" />
      <div className="relative max-w-[1280px] mx-auto px-6">
        {/* Meta line */}
        <div
          className="flex justify-between items-center text-[11px] mb-7"
          style={{ color: "var(--fg-dim)" }}
        >
          <div className="flex gap-6 items-center">
            <span
              className="px-2.5 py-1 text-[10px] uppercase border"
              style={{
                color: "var(--signal)",
                borderColor: "var(--signal)",
                letterSpacing: "0.16em",
              }}
            >
              ▲ EXP/01 · ENV CONTRÔLÉ
            </span>
            <span>// niveau d&apos;accès : ouvert</span>
          </div>
          <div className="hidden md:flex gap-6">
            <span>NŒUD : PARIS-FR · 48.85N 2.34E</span>
          </div>
        </div>

        {/* Title */}
        <h1
          className="font-display font-bold uppercase relative -mx-2"
          style={{
            fontSize: "clamp(72px, 14vw, 220px)",
            letterSpacing: "-0.04em",
            lineHeight: 0.88,
          }}
        >
          <span className="glitch" data-text="BREAK THE">
            BREAK THE
          </span>
          <span
            className="block"
            style={{ color: "var(--fg)" }}
          >
            LOOP
            <span
              className="font-mono font-light animate-blink"
              style={{
                color: "var(--signal)",
                fontSize: "0.6em",
                marginLeft: "0.1em",
              }}
            >
              _
            </span>
          </span>
        </h1>

        {/* Sub-grid */}
        <div
          className="mt-9 grid gap-8 md:gap-12 items-start pt-7"
          style={{
            borderTop: "1px solid var(--line)",
            gridTemplateColumns: "1.4fr 1fr 1.6fr",
          }}
        >
          <div className="hero-sub-mobile">
            <p
              className="font-display font-medium"
              style={{
                fontSize: "22px",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              Probe
              <span style={{ color: "var(--signal)", margin: "0 0.3em" }}>·</span>
              Exploit
              <span style={{ color: "var(--signal)", margin: "0 0.3em" }}>·</span>
              Comprendre
              <span style={{ color: "var(--signal)" }}>.</span>
            </p>
          </div>

          <p
            className="text-[13px] leading-[1.7]"
            style={{ color: "var(--fg-dim)" }}
          >
            Une arène red team pour les systèmes IA. Teste les{" "}
            <span style={{ color: "var(--fg)" }}>vulnérabilités</span>, casse les{" "}
            <span style={{ color: "var(--fg)" }}>contraintes</span>, et apprends comment les
            systèmes intelligents échouent sous pression.
          </p>

          <div className="flex flex-col gap-2.5">
            <Link
              href="/arena"
              className="flex items-center justify-between gap-4 px-4 py-3.5 text-xs uppercase font-medium border relative transition-all duration-200 hover:!bg-[var(--signal)] hover:!text-[var(--bg)]"
              style={{
                borderColor: "var(--signal)",
                color: "var(--fg)",
                background: "linear-gradient(180deg, transparent, rgba(255,80,40,0.06))",
                letterSpacing: "0.08em",
              }}
            >
              <span
                className="absolute left-0 top-0 bottom-0 w-[3px]"
                style={{ background: "var(--signal)" }}
              />
              <span>&gt;_ ENTRER DANS LE SYSTÈME</span>
              <span className="font-mono">→</span>
            </Link>
            <Link
              href="/arena"
              className="flex items-center justify-between gap-4 px-4 py-3.5 text-xs uppercase font-medium border transition-colors hover:text-[var(--fg)] hover:border-[var(--fg)]"
              style={{
                borderColor: "var(--line-2)",
                color: "var(--fg-dim)",
                letterSpacing: "0.08em",
              }}
            >
              <span>VOIR LES CHALLENGES</span>
              <span className="font-mono">↗</span>
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hero-sub-mobile + p,
          .hero-sub-mobile + p + div { grid-column: 1 / -1; }
          section .grid[style*="1.4fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
