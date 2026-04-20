/**
 * Project catalogue — currently hand-rolled; step 9 replaces this with a
 * filesystem-backed MDX reader under `content/projects/`. The shape is
 * stable so homepage/landing usage does not have to change.
 */

export type ProjectStatus = "live" | "archived" | "redacted";

export type ProjectCategory =
  | "red-team"
  | "incident-response"
  | "audit"
  | "llm-security"
  | "research";

export type Project = {
  readonly slug: string;
  readonly ordinal: string;
  readonly title: string;
  readonly tagline: string;
  readonly category: ProjectCategory;
  readonly status: ProjectStatus;
  readonly year: string;
  readonly stack: readonly string[];
  readonly featured: boolean;
  /**
   * Short role statement (1–2 lines) — used on the landing card.
   */
  readonly role: string;
};

/**
 * NOTE: order matters. The landing picks `featured: true` entries in order.
 */
export const PROJECTS: readonly Project[] = [
  {
    slug: "red-team-cyberrange",
    ordinal: "01",
    title: "Red Team CyberRange",
    tagline: "SAÉ red team — Kill Chain complète sur infra AD simulée",
    category: "red-team",
    status: "live",
    year: "2026",
    stack: ["Cobalt Strike", "BloodHound", "Impacket", "Mythic", "Active Directory"],
    featured: true,
    role: "Red teamer — recon → C2 → lateral → domain admin en 72h.",
  },
  {
    slug: "incident-response-r2d2",
    ordinal: "02",
    title: "IR — Malware R2D2",
    tagline: "Investigation forensique d'un RAT Linux auto-propagé",
    category: "incident-response",
    status: "live",
    year: "2025",
    stack: ["Volatility", "YARA", "Suricata", "Velociraptor", "Ghidra"],
    featured: true,
    role: "Analyste forensique — timeline complète, IOCs, scope confinement.",
  },
  {
    slug: "hackaprompt-llm-security",
    ordinal: "03",
    title: "HackAPrompt — LLM red team",
    tagline: "Top mondial sur la compétition LearnPrompting / HackAPrompt",
    category: "llm-security",
    status: "live",
    year: "2025",
    stack: ["Prompt injection", "Jailbreak taxonomy", "Context smuggling", "RAG poisoning"],
    featured: true,
    role: "Offensive LLM researcher — exploits reproductibles, write-ups techniques.",
  },
  {
    slug: "audit-pme-stage",
    ordinal: "04",
    title: "Audit PME (stage)",
    tagline: "Audit externe de sécurité périmétrique + pentest web — PME française",
    category: "audit",
    status: "redacted",
    year: "2025",
    stack: ["Nmap", "Burp Suite", "Nessus", "OWASP Top 10", "PASSI-ready methodology"],
    featured: false,
    role: "Pentester junior — rapport PASSI-style, 11 findings dont 2 critiques.",
  },
] as const;

export function getFeaturedProjects(): readonly Project[] {
  return PROJECTS.filter((p) => p.featured);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getAllProjects(): readonly Project[] {
  return PROJECTS;
}

const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  "red-team": "Red Team",
  "incident-response": "Incident Response",
  audit: "Audit",
  "llm-security": "LLM Security",
  research: "Recherche",
};

export function labelForCategory(category: ProjectCategory): string {
  return CATEGORY_LABELS[category];
}
