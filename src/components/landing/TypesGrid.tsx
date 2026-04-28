import Link from "next/link";

const VECTORS = [
  {
    n: "01",
    symbol: "{ }",
    name: "Prompt\nInjection",
    desc: "Manipule le modèle pour révéler des données cachées. Glisse des instructions au-delà des couches défensives.",
    challenges: 10,
    pass: "—",
    href: "/arena",
    active: true,
  },
  {
    n: "02",
    symbol: "⌬",
    name: "System\nExtraction",
    desc: "Extrait les instructions ou secrets protégés. Reconstruis ce que le modèle a reçu l'ordre de cacher.",
    challenges: 0,
    pass: "soon",
    href: "#",
    active: false,
  },
  {
    n: "03",
    symbol: "▣",
    name: "Defense",
    desc: "Construis des prompts qui résistent aux attaques adverses. Mets-toi dans les chaussures de l'autre côté.",
    challenges: 0,
    pass: "soon",
    href: "#",
    active: false,
  },
  {
    n: "04",
    symbol: "↯",
    name: "Agent\nExploitation",
    desc: "Détourne les outils, actions et flux logiques. Pousse les agents autonomes au-delà de leurs garde-fous.",
    challenges: 0,
    pass: "soon",
    href: "#",
    active: false,
  },
];

export function TypesGrid() {
  return (
    <section style={{ borderBottom: "1px solid var(--line)", padding: "88px 0 0" }}>
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-8 items-end mb-12">
          <p className="font-mono text-sm" style={{ color: "var(--signal)", letterSpacing: "0.1em" }}>
            // 02 — VECTEURS
          </p>
          <h2
            className="font-display font-bold uppercase"
            style={{ fontSize: "clamp(42px, 5vw, 64px)", letterSpacing: "-0.03em", lineHeight: 0.95 }}
          >
            Quatre façons
            <br />
            de casser un système
          </h2>
          <p
            className="text-[11px] uppercase text-right"
            style={{ color: "var(--fg-dim)", letterSpacing: "0.1em" }}
          >
            04 / VECTEURS
            <br />
            CLIQUE POUR COMMENCER
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6">
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          style={{ border: "1px solid var(--line-2)", borderBottom: "none" }}
        >
          {VECTORS.map((v, i) => {
            const isLastInRow = (i + 1) % 4 === 0;
            const Wrapper: React.ElementType = v.active ? Link : "div";
            const wrapperProps = v.active ? { href: v.href } : {};
            return (
              <Wrapper
                key={v.n}
                {...wrapperProps}
                className="flex flex-col gap-6 p-6 pt-7 pb-8 min-h-[340px] relative transition-colors group"
                style={{
                  borderRight: isLastInRow ? "none" : "1px solid var(--line-2)",
                  borderBottom: "1px solid var(--line-2)",
                  background: "var(--bg)",
                  cursor: v.active ? "pointer" : "not-allowed",
                  opacity: v.active ? 1 : 0.55,
                }}
              >
                <div
                  className="flex justify-between items-start text-[10px] uppercase"
                  style={{ color: "var(--fg-mute)", letterSpacing: "0.1em" }}
                >
                  <span>VECTEUR.{v.n}</span>
                  <span style={{ color: v.active ? "var(--signal)" : "var(--fg-mute)" }}>●</span>
                </div>
                <div
                  className="font-mono font-light transition-colors group-hover:[color:var(--signal)]"
                  style={{ fontSize: 80, lineHeight: 0.8, color: "var(--fg)" }}
                >
                  {v.symbol}
                </div>
                <div>
                  <div
                    className="font-display font-bold uppercase whitespace-pre-line"
                    style={{ fontSize: 24, letterSpacing: "-0.02em", lineHeight: 1 }}
                  >
                    {v.name}
                  </div>
                  <div
                    className="mt-3.5 text-xs"
                    style={{ color: "var(--fg-dim)", lineHeight: 1.6 }}
                  >
                    {v.desc}
                  </div>
                </div>
                <div
                  className="mt-auto flex justify-between text-[10px] uppercase pt-3"
                  style={{
                    color: "var(--fg-mute)",
                    borderTop: "1px solid var(--line)",
                    letterSpacing: "0.08em",
                  }}
                >
                  <span>{v.challenges} challenges</span>
                  <span style={{ color: v.active ? "var(--signal)" : "var(--fg-mute)" }}>
                    {v.active ? "actif" : v.pass}
                  </span>
                </div>
              </Wrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
