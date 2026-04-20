/**
 * Lockheed Martin Cyber Kill Chain — the 7-step model used throughout
 * the red-team community. Numbered 01…07 so the UI can address them
 * by ordinal the way the rest of the site numbers its sections.
 *
 * Coordinates are normalised to a [-1, 1] cube; the scene scales them.
 * Laid out as an arc so no two nodes overlap in screen space from the
 * default camera position (0, 0, 4).
 */

export type KillChainStage = {
  readonly id: string;
  readonly ordinal: string;
  readonly title: string;
  readonly short: string;
  /** One-liner shown under the node title on hover. */
  readonly tagline: string;
  /** [x, y, z] in world space (cube [-1, 1]³). */
  readonly position: readonly [number, number, number];
};

export const KILL_CHAIN_STAGES: readonly KillChainStage[] = [
  {
    id: "reconnaissance",
    ordinal: "01",
    title: "Reconnaissance",
    short: "Recon",
    tagline: "OSINT · énumération · surface d'attaque",
    position: [-1.4, 0.6, 0],
  },
  {
    id: "weaponization",
    ordinal: "02",
    title: "Weaponization",
    short: "Weapon",
    tagline: "payload custom · packaging · staging",
    position: [-0.95, -0.25, 0.15],
  },
  {
    id: "delivery",
    ordinal: "03",
    title: "Delivery",
    short: "Deliver",
    tagline: "phishing · USB drop · supply chain",
    position: [-0.35, 0.5, -0.15],
  },
  {
    id: "exploitation",
    ordinal: "04",
    title: "Exploitation",
    short: "Exploit",
    tagline: "CVE · 0-day · humaine (social engineering)",
    position: [0.25, -0.35, 0.1],
  },
  {
    id: "installation",
    ordinal: "05",
    title: "Installation",
    short: "Install",
    tagline: "persistance · backdoor · cron · registry",
    position: [0.8, 0.45, -0.05],
  },
  {
    id: "c2",
    ordinal: "06",
    title: "Command & Control",
    short: "C2",
    tagline: "beacon · DNS tunnel · post-ex framework",
    position: [1.3, -0.15, 0.15],
  },
  {
    id: "actions",
    ordinal: "07",
    title: "Actions on Objectives",
    short: "Impact",
    tagline: "exfil · chiffrement · lateral movement",
    position: [1.75, 0.55, 0],
  },
] as const;
