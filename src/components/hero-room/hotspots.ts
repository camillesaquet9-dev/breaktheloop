/**
 * Hotspot data — the 5 clickable markers overlaid on the hacker-room scene.
 *
 * Positions are expressed in the GLB's local coordinate system (metres).
 * They're placed by visual inspection of the scene — expect minor
 * re-tuning once the scene is rendered.
 *
 * Each hotspot has:
 *   - `id`       : stable slug (also used as aria-label suffix)
 *   - `label`    : visible tooltip text
 *   - `ordinal`  : 01..05 (display, matches editorial style)
 *   - `position` : [x, y, z] world coord for the <Html> marker
 *   - `href`     : route or in-page anchor to navigate to on click
 *   - `kind`     : "route" | "anchor" | "easter" — drives click handler
 */

export type Hotspot = {
  readonly id: string;
  readonly ordinal: string;
  readonly label: string;
  readonly position: readonly [number, number, number];
  readonly href: string;
  readonly kind: "route" | "anchor" | "easter";
};

export const HOTSPOTS: readonly Hotspot[] = [
  {
    id: "monitors",
    ordinal: "01",
    label: "Projects",
    position: [0, 1.1, -0.2],
    href: "/projects",
    kind: "route",
  },
  {
    id: "rack",
    ordinal: "02",
    label: "Contact",
    position: [-1.6, 0.8, -0.4],
    href: "/contact",
    kind: "route",
  },
  {
    id: "notebook",
    ordinal: "03",
    label: "About",
    position: [0.7, 0.6, 0.3],
    href: "/about",
    kind: "route",
  },
  {
    id: "wall-notes",
    ordinal: "04",
    label: "Skills",
    position: [-0.2, 2.1, -1.2],
    href: "#skills",
    kind: "anchor",
  },
  {
    id: "mug",
    ordinal: "05",
    label: "☕",
    position: [1.2, 0.7, 0.5],
    href: "easter",
    kind: "easter",
  },
] as const;
