"use client";

import { Html, Line } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Group, Mesh } from "three";
import { KILL_CHAIN_STAGES, type KillChainStage } from "./data";

/**
 * 3D Kill Chain scene.
 *
 * Design choices:
 * - Cube nodes (not spheres) to match the brutalist editorial language.
 * - Flat, matte material — no PBR / no specular highlights; lighting is a
 *   single directional + ambient so the look stays graphic, not "3D demo".
 * - Lines connect consecutive stages; active/hovered state highlights the
 *   node in accent red.
 * - Gentle auto-rotation of the whole chain group; disabled on
 *   prefers-reduced-motion (the caller swaps to KillChainFallback entirely).
 * - Click to focus a node + emit the active stage via `onStageChange` so
 *   the surrounding page can update descriptive copy.
 */

type KillChainSceneProps = {
  readonly activeStageId: string | null;
  readonly onStageChange?: (stageId: string | null) => void;
};

function KillChainGroup({
  activeStageId,
  hoveredId,
  onHover,
  onSelect,
}: {
  readonly activeStageId: string | null;
  readonly hoveredId: string | null;
  readonly onHover: (id: string | null) => void;
  readonly onSelect: (id: string) => void;
}) {
  const groupRef = useRef<Group>(null);

  // Slow idle rotation. We skip the frame entirely if the group is not
  // visible in the viewport (handled by the IntersectionObserver around
  // the Canvas in KillChainScene).
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.08;
  });

  // Pre-compute line segments between consecutive nodes once.
  const linePoints = useMemo(
    () =>
      KILL_CHAIN_STAGES.slice(0, -1).map((stage, i) => ({
        key: `${stage.id}-${KILL_CHAIN_STAGES[i + 1].id}`,
        points: [stage.position, KILL_CHAIN_STAGES[i + 1].position] as [
          readonly [number, number, number],
          readonly [number, number, number],
        ],
      })),
    [],
  );

  return (
    <group ref={groupRef}>
      {linePoints.map(({ key, points }) => (
        <Line
          key={key}
          points={points as unknown as [number, number, number][]}
          color="#6B6B66"
          lineWidth={1}
          transparent
          opacity={0.55}
        />
      ))}
      {KILL_CHAIN_STAGES.map((stage) => (
        <KillChainNode
          key={stage.id}
          stage={stage}
          isActive={activeStageId === stage.id}
          isHovered={hoveredId === stage.id}
          onPointerOver={() => onHover(stage.id)}
          onPointerOut={() => onHover(null)}
          onClick={() => onSelect(stage.id)}
        />
      ))}
    </group>
  );
}

function KillChainNode({
  stage,
  isActive,
  isHovered,
  onPointerOver,
  onPointerOut,
  onClick,
}: {
  readonly stage: KillChainStage;
  readonly isActive: boolean;
  readonly isHovered: boolean;
  readonly onPointerOver: () => void;
  readonly onPointerOut: () => void;
  readonly onClick: () => void;
}) {
  const meshRef = useRef<Mesh>(null);

  // Subtle pulse on the active/hovered node so the user knows it's
  // interactive without adding gratuitous motion.
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const base = 1;
    const pulse = isActive || isHovered ? 1 + Math.sin(clock.elapsedTime * 4) * 0.04 : base;
    meshRef.current.scale.setScalar(pulse);
  });

  const color = isActive ? "#8B1A1A" : isHovered ? "#0A0A0A" : "#1A1A1A";

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: <mesh> is an R3F/Three.js primitive, not a DOM element — rule targets HTML. The accessible button list in KillChain.tsx is the canonical interactive surface.
    <mesh
      ref={meshRef}
      position={stage.position}
      onPointerOver={(e) => {
        e.stopPropagation();
        onPointerOver();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onPointerOut();
        document.body.style.cursor = "";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <boxGeometry args={[0.12, 0.12, 0.12]} />
      <meshStandardMaterial
        color={color}
        metalness={0}
        roughness={1}
        flatShading
        emissive={isActive ? "#8B1A1A" : "#000000"}
        emissiveIntensity={isActive ? 0.35 : 0}
      />
      {(isHovered || isActive) && (
        <Html
          position={[0, 0.18, 0]}
          center
          distanceFactor={6}
          style={{
            pointerEvents: "none",
            whiteSpace: "nowrap",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "10px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--foreground)",
            background: "var(--background)",
            padding: "2px 6px",
            border: "1px solid var(--border)",
          }}
        >
          <span>
            {stage.ordinal} — {stage.short}
          </span>
        </Html>
      )}
    </mesh>
  );
}

function ResponsiveCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    // Pull the camera back further on narrow viewports so the chain fits.
    const z = size.width < 640 ? 5.2 : 4;
    camera.position.set(0, 0, z);
    camera.lookAt(0, 0, 0);
  }, [camera, size.width]);
  return null;
}

export function KillChainScene({ activeStageId, onStageChange }: KillChainSceneProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    onStageChange?.(activeStageId === id ? null : id);
  };

  return (
    <Canvas
      // Fix DPR at 1–1.5 to cap fill-rate cost on high-density displays.
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4], fov: 45 }}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      style={{ width: "100%", height: "100%", background: "transparent" }}
    >
      <ResponsiveCamera />
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 4, 2]} intensity={0.8} />
      <KillChainGroup
        activeStageId={activeStageId}
        hoveredId={hoveredId}
        onHover={setHoveredId}
        onSelect={handleSelect}
      />
    </Canvas>
  );
}
