import type { Metadata } from "next";
import { Timeline } from "@/components/site/Timeline";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Parcours, compétences et méthodologie de Camille Saquet — étudiant cybersécurité offense-forward.",
};

const SKILLS = [
  {
    category: "Offensive",
    items: [
      "Pentest web (OWASP Top 10)",
      "Red team AD (Kerberoasting, ADCS, BloodHound)",
      "C2 frameworks (Cobalt Strike, Mythic)",
      "Post-exploitation Linux/Windows",
      "Social engineering / phishing ciblé",
    ],
  },
  {
    category: "LLM / AI security",
    items: [
      "Prompt injection (direct + indirect)",
      "Jailbreak taxonomy",
      "RAG poisoning",
      "Context smuggling",
      "Agent exploitation",
    ],
  },
  {
    category: "Defensive / forensic",
    items: [
      "Analyse mémoire (Volatility)",
      "IR & forensique Linux",
      "YARA / Sigma / Suricata",
      "Reverse engineering (Ghidra)",
      "SOC N2-N3 fundamentals",
    ],
  },
  {
    category: "Infra / réseaux",
    items: [
      "Stormshield SNS (certifié CSNA)",
      "Routing / switching avancé",
      "VPN IPsec / SSL",
      "Segmentation / DMZ",
      "Linux sysadmin + scripting",
    ],
  },
];

export default function AboutPage() {
  return (
    <main id="main-content" tabIndex={-1} className="flex-1">
      {/* =============================================================
          01 — BIO
         ============================================================= */}
      <section
        aria-labelledby="about-title"
        className="mx-auto w-full max-w-6xl px-6 pt-16 pb-16 md:pt-24"
      >
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          — About / whoami
        </p>

        <h1 id="about-title" className="mt-6 font-display text-5xl leading-[0.95] md:text-7xl">
          Camille Saquet
        </h1>

        <div className="mt-10 grid gap-10 md:grid-cols-[2fr_1fr] md:gap-16">
          <div className="space-y-6 text-base leading-relaxed md:text-lg">
            <p>
              Je suis étudiant en 3<sup>e</sup> année de BUT Réseaux &amp; Télécoms à l&apos;IUT de
              Lannion, parcours cybersécurité. Admis en alternance à l&apos;<strong>ESNA</strong>{" "}
              pour la rentrée de septembre 2026, cycle Ingénieur Cyberdéfense.
            </p>
            <p>
              Mon profil est <strong>offense-forward</strong> : pentest, red team, audit.
              J&apos;aime comprendre comment les choses se cassent avant de réfléchir à comment les
              durcir. Côté défensif, je reste solide — l&apos;IR et le forensique restent des outils
              du métier, pas un autre monde.
            </p>
            <p>
              Je passe une partie conséquente de mon temps libre sur la{" "}
              <strong>sécurité LLM</strong> — HackAPrompt (top mondial), taxonomie des jailbreaks,
              indirect prompt injection, agent exploitation. C&apos;est la surface d&apos;attaque
              qui monte le plus vite en ce moment, et personne ne sait vraiment la défendre.
            </p>
            <p className="font-mono text-sm text-muted-foreground">
              <span className="text-foreground">$</span> cat /etc/values
              <br />
              <span className="text-foreground">&gt;</span> transparence sur la méthode · respect du
              scope · pas de théâtre
            </p>
          </div>

          <aside className="space-y-3 border-l border-border pl-6 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground md:pl-8">
            <p>
              <span className="text-foreground">Localisation</span> — Lannion, FR
            </p>
            <p>
              <span className="text-foreground">Langues</span> — FR (natif) · EN (C1)
            </p>
            <p>
              <span className="text-foreground">Permis</span> — B
            </p>
            <p>
              <span className="text-foreground">Mobilité</span> — nationale
            </p>
            <p>
              <span className="text-foreground">Dispo.</span> — sept. 2026
            </p>
            <p>
              <span className="text-foreground">Durée</span> — 3 ans
            </p>
          </aside>
        </div>
      </section>

      {/* =============================================================
          02 — TIMELINE
         ============================================================= */}
      <section aria-labelledby="timeline-title" className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="mb-10 flex items-baseline gap-4">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            02 —
          </p>
          <h2 id="timeline-title" className="font-display text-3xl leading-tight md:text-5xl">
            Parcours
          </h2>
        </div>
        <Timeline />
      </section>

      {/* =============================================================
          03 — SKILLS
         ============================================================= */}
      <section aria-labelledby="skills-title" className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="mb-10 flex items-baseline gap-4">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            03 —
          </p>
          <h2 id="skills-title" className="font-display text-3xl leading-tight md:text-5xl">
            Compétences
          </h2>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {SKILLS.map((group) => (
            <div key={group.category}>
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-accent">
                {group.category}
              </p>
              <ul className="space-y-1.5 text-sm">
                {group.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden className="text-muted-foreground">
                      ─
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
