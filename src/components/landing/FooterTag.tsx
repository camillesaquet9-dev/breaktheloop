export function FooterTag() {
  return (
    <footer
      className="pt-30 pb-10"
      style={{
        background: "var(--bg)",
        borderTop: "1px solid var(--line)",
        padding: "120px 0 40px",
      }}
    >
      <div className="max-w-[1280px] mx-auto px-6">
        <div
          className="font-display font-bold uppercase"
          style={{
            fontSize: "clamp(56px, 10vw, 140px)",
            letterSpacing: "-0.04em",
            lineHeight: 0.9,
          }}
        >
          Tous les
          <br />
          systèmes
          <br />
          ne sont pas
          <br />
          <span style={{ color: "var(--signal)" }}>sûrs.</span>
        </div>

        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-6 text-[11px] uppercase"
          style={{
            borderTop: "1px solid var(--line)",
            color: "var(--fg-mute)",
            letterSpacing: "0.1em",
          }}
        >
          <div>
            <b className="block mb-1.5 font-medium" style={{ color: "var(--fg-dim)" }}>
              Arène
            </b>
            breaktheloop.fr
          </div>
          <div>
            <b className="block mb-1.5 font-medium" style={{ color: "var(--fg-dim)" }}>
              Build
            </b>
            0.1.0 · 2026.04.28
          </div>
          <div>
            <b className="block mb-1.5 font-medium" style={{ color: "var(--fg-dim)" }}>
              Avis
            </b>
            Environnement contrôlé. Usage offensif réservé aux systèmes pour lesquels tu es
            autorisé.
          </div>
          <div>
            <b className="block mb-1.5 font-medium" style={{ color: "var(--fg-dim)" }}>
              Statut
            </b>
            <span style={{ color: "var(--safe)" }}>● TOUS SYSTÈMES OPÉRATIONNELS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
