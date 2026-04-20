/**
 * Timeline / parcours for the About page.
 *
 * Events are sorted newest-first at render time; authoring order here is
 * not significant. Use ISO `date` (YYYY-MM or YYYY-MM-DD).
 */

export type TimelineEventKind =
  | "education"
  | "certification"
  | "competition"
  | "internship"
  | "operation"
  | "milestone";

export type TimelineEvent = {
  readonly date: string;
  readonly kind: TimelineEventKind;
  readonly title: string;
  readonly org: string;
  readonly location?: string;
  readonly body: string;
  /** Upcoming events — rendered with a different affordance. */
  readonly upcoming?: boolean;
};

export const TIMELINE: readonly TimelineEvent[] = [
  {
    date: "2026-09",
    kind: "education",
    title: "Alternance Ingénieur Cyberdéfense",
    org: "ESNA",
    body: "Rentrée en alternance 3 ans. Cherche encore mon entreprise d'accueil.",
    upcoming: true,
  },
  {
    date: "2026-03",
    kind: "milestone",
    title: "Admission ESNA — rang top",
    org: "ESNA",
    body: "Admis en école d'ingénieur Cyberdéfense après concours. Classement en tête de promo.",
  },
  {
    date: "2026-02",
    kind: "operation",
    title: "SAÉ Red Team CyberRange",
    org: "IUT Lannion",
    location: "Lannion, FR",
    body: "Opération offensive 72h sur infra AD simulée. Domain Admin obtenu en 68h. Rapport PASSI-style produit en post-op.",
  },
  {
    date: "2025-10",
    kind: "competition",
    title: "Top mondial HackAPrompt",
    org: "LearnPrompting",
    body: "Classement en tête de compétition LLM red team. Taxonomie d'exploits documentée — prompt injection, context smuggling, indirect prompt injection.",
  },
  {
    date: "2025-06",
    kind: "internship",
    title: "Stage — audit PME",
    org: "ESN Rennaise (NDA)",
    location: "Rennes, FR",
    body: "Audit externe + pentest web méthodologie PASSI. 11 findings dont 2 critiques. Rapport 58 pages.",
  },
  {
    date: "2025-04",
    kind: "certification",
    title: "CSNA — Certified Stormshield Network Administrator",
    org: "Stormshield",
    body: "Certification administration firewall Stormshield SNS. Fondamentaux NGFW, ASQ, VPN, haute disponibilité.",
  },
  {
    date: "2024-09",
    kind: "education",
    title: "BUT R&T — parcours cybersécurité",
    org: "IUT Lannion",
    location: "Lannion, FR",
    body: "Bachelor Universitaire de Technologie Réseaux & Télécoms, parcours Cybersécurité (3e année en cours).",
  },
  {
    date: "2023-09",
    kind: "milestone",
    title: "Début du travail red team / pentest",
    org: "Autoformation",
    body: "TryHackMe, HackTheBox, labs persos AD. Premier virage offensif après une entrée côté défense/réseaux.",
  },
] as const;

const KIND_LABELS: Record<TimelineEventKind, string> = {
  education: "Formation",
  certification: "Certification",
  competition: "Compétition",
  internship: "Stage",
  operation: "Opération",
  milestone: "Milestone",
};

export function labelForKind(kind: TimelineEventKind): string {
  return KIND_LABELS[kind];
}

export function formatTimelineDate(iso: string): string {
  // YYYY-MM or YYYY-MM-DD → "MMM YYYY" (fr-FR).
  const [y, m] = iso.split("-");
  const months = [
    "Janv.",
    "Févr.",
    "Mars",
    "Avr.",
    "Mai",
    "Juin",
    "Juil.",
    "Août",
    "Sept.",
    "Oct.",
    "Nov.",
    "Déc.",
  ];
  const idx = Math.min(11, Math.max(0, Number.parseInt(m, 10) - 1));
  return `${months[idx]} ${y}`;
}
