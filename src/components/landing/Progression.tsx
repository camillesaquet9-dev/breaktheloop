const BARS = [
  { label: "PROMPT INJ.", value: 0, color: "signal" },
  { label: "SYS. EXTRACT", value: 0, color: "signal" },
  { label: "DEFENSE", value: 0, color: "safe" },
  { label: "AGENT EXPLOIT", value: 0, color: "fg" },
  { label: "STEALTH IDX.", value: 0, color: "signal" },
  { label: "SIGNAL/BRUIT", value: 0, color: "fg" },
];

export function Progression() {
  return (
    <section style={{ borderBottom: "1px solid var(--line)", padding: "88px 0" }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-8 items-end mb-12">
          <p
            className="font-mono text-sm"
            style={{ color: "var(--signal)", letterSpacing: "0.1em" }}
          >
            // 03 — SIGNAL
          </p>
          <h2
            className="font-display font-bold uppercase"
            style={{
              fontSize: "clamp(42px, 5vw, 64px)",
              letterSpacing: "-0.03em",
              lineHeight: 0.95,
            }}
          >
            Ton signal
            <br />
            évolue
          </h2>
          <p
            className="text-[11px] uppercase text-right"
            style={{ color: "var(--fg-dim)", letterSpacing: "0.1em" }}
          >
            PROFIL ADAPTATIF
            <br />
            CHIFFREMENT : AES-256
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-16 items-center">
          <div>
            <p
              className="text-[15px] leading-[1.7] pl-4"
              style={{
                color: "var(--fg-dim)",
                borderLeft: "2px solid var(--signal)",
              }}
            >
              Chaque breach réussie remodèle ton profil. Suis ta progression, débloque des
              systèmes plus difficiles, et grimpe dans le classement.
            </p>
            <ul
              className="mt-8 flex flex-col gap-3.5 text-xs"
              style={{ color: "var(--fg-dim)" }}
            >
              {[
                "La courbe de difficulté s'adapte à ton style d'attaque.",
                "Les patterns de signature sont loggués et ajoutés au corpus défensif.",
                "De nouveaux vecteurs se débloquent à mesure que ta classe d'opérateur évolue.",
              ].map((t) => (
                <li key={t} className="flex gap-3.5">
                  <span style={{ color: "var(--signal)", minWidth: 24 }}>→</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="p-8 relative"
            style={{ border: "1px solid var(--line-2)", background: "var(--bg-1)" }}
          >
            <div
              className="flex justify-between text-[10px] uppercase mb-6"
              style={{ color: "var(--fg-mute)", letterSpacing: "0.1em" }}
            >
              <span>OPÉRATEUR · 0xA3F2 · CLASS-I</span>
              <span style={{ color: "var(--signal)" }}>EN ATTENTE ●</span>
            </div>
            <div className="flex flex-col gap-3.5">
              {BARS.map((b) => (
                <div
                  key={b.label}
                  className="grid items-center gap-3.5 text-[11px]"
                  style={{
                    gridTemplateColumns: "120px 1fr 60px",
                    color: "var(--fg-dim)",
                  }}
                >
                  <span>{b.label}</span>
                  <div
                    className="h-2 relative"
                    style={{
                      background: "var(--bg-2)",
                      border: "1px solid var(--line-2)",
                    }}
                  >
                    <div
                      className="h-full"
                      style={{
                        width: `${b.value}%`,
                        background:
                          b.color === "signal"
                            ? "var(--signal)"
                            : b.color === "safe"
                              ? "var(--safe)"
                              : "var(--fg)",
                      }}
                    />
                  </div>
                  <span
                    className="text-right tabular-nums"
                    style={{ color: "var(--fg)" }}
                  >
                    {b.value}%
                  </span>
                </div>
              ))}
            </div>
            <div
              className="mt-6 pt-4 flex justify-between text-[10px] uppercase"
              style={{
                borderTop: "1px solid var(--line)",
                color: "var(--fg-mute)",
                letterSpacing: "0.1em",
              }}
            >
              <span>NIVEAU SUIVANT · CLASS-II</span>
              <span>0 / 1 000 SIG</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
