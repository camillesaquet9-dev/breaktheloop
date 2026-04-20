import { KILL_CHAIN_STAGES } from "./data";

/**
 * Static SVG rendering of the Kill Chain, used when:
 *   - the user prefers reduced motion,
 *   - the browser/device cannot run WebGL,
 *   - the 3D bundle is still loading (suspense fallback).
 *
 * Pure server component. No animation, no JS.
 *
 * Visual language matches the 3D scene: square nodes, thin chain lines,
 * ivory background, monospace labels with ordinals.
 */

const VIEWBOX_W = 720;
const VIEWBOX_H = 280;

// Map the [-1.4, 1.75] x-range of the 3D layout to the SVG viewbox.
const X_MIN = -1.4;
const X_MAX = 1.75;
const Y_MIN = -0.35;
const Y_MAX = 0.6;

function project(x: number, y: number): [number, number] {
  const padding = 60;
  const usableW = VIEWBOX_W - padding * 2;
  const usableH = VIEWBOX_H - padding * 2;
  const px = padding + ((x - X_MIN) / (X_MAX - X_MIN)) * usableW;
  // Flip Y so +y in 3D is "up" visually.
  const py = padding + ((Y_MAX - y) / (Y_MAX - Y_MIN)) * usableH;
  return [px, py];
}

export function KillChainFallback() {
  const points = KILL_CHAIN_STAGES.map((stage) => project(stage.position[0], stage.position[1]));

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
      role="img"
      aria-label="Cyber Kill Chain — sept étapes d'une opération offensive"
      className="h-auto w-full text-foreground"
    >
      <title>Cyber Kill Chain — 7 étapes</title>

      {/* Chain lines */}
      {points.slice(0, -1).map(([x1, y1], i) => {
        const [x2, y2] = points[i + 1];
        const key = `${KILL_CHAIN_STAGES[i].id}-${KILL_CHAIN_STAGES[i + 1].id}`;
        return (
          <line
            key={key}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth={1}
            strokeOpacity={0.35}
          />
        );
      })}

      {/* Nodes */}
      {KILL_CHAIN_STAGES.map((stage, i) => {
        const [cx, cy] = points[i];
        return (
          <g key={stage.id}>
            <rect
              x={cx - 8}
              y={cy - 8}
              width={16}
              height={16}
              fill="currentColor"
              stroke="currentColor"
            />
            <text
              x={cx}
              y={cy + 30}
              textAnchor="middle"
              fontFamily="var(--font-mono, monospace)"
              fontSize={9}
              fill="currentColor"
              opacity={0.6}
              letterSpacing="0.15em"
            >
              {stage.ordinal}
            </text>
            <text
              x={cx}
              y={cy + 44}
              textAnchor="middle"
              fontFamily="var(--font-mono, monospace)"
              fontSize={10}
              fill="currentColor"
              letterSpacing="0.05em"
            >
              {stage.short.toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
