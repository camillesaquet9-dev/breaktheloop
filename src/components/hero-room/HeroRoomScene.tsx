"use client";

import { Environment, Preload } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";
import { CameraRig } from "./CameraRig";
import { HotspotMarker } from "./HotspotMarker";
import { HOTSPOTS } from "./hotspots";
import { NameBehind } from "./NameBehind";
import { Room } from "./Room";

/**
 * The R3F `<Canvas>` that glues together the hero-room sub-components.
 *
 * Scene recipe:
 *   - Room: GLB of the hacker office (Draco + WebP, see Room.tsx).
 *   - NameBehind: "CAMILLE SAQUET" as flat 3D text behind the desk.
 *   - 5× HotspotMarker: clickable badges projected into 3D via drei <Html>.
 *   - CameraRig: drives position/lookAt from scroll progress + pointer.
 *
 * Lighting: one directional key + hemisphere ambient + HDR environment
 * (drei's "warehouse" preset, self-hosted by drei inside its CDN bundle).
 * The environment gives believable PBR reflections to the metal props
 * without paying for real-time shadow-map quality tuning.
 *
 * Perf:
 *   - `dpr={[1, 1.6]}` caps device-pixel-ratio at 1.6 so retinas don't tank.
 *   - `frameloop="demand"` would pause idle frames, but we need continuous
 *     updates for the pointer-parallax smoothing, so we stay on "always".
 *   - `<Preload all/>` warms textures/geometry in the same pass as load.
 */
export function HeroRoomScene({
  progressRef,
  pointerRef,
}: {
  readonly progressRef: React.MutableRefObject<number>;
  readonly pointerRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
      camera={{ fov: 38, near: 0.05, far: 50, position: [2.4, 1.9, 3.0] }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#F4F1EA"]} />
      <fog attach="fog" args={["#F4F1EA", 8, 22]} />

      {/* Lighting rig — warm key light + cool fill, HDR env for reflections. */}
      <ambientLight intensity={0.35} />
      <hemisphereLight args={["#F4F1EA", "#1a1a1a", 0.45]} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.15}
        color="#ffe7c6"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      {/* Subtle accent-red rim to tie the scene to the brand hue. */}
      <pointLight position={[-2.2, 1.2, 1.8]} intensity={0.6} color="#8B1A1A" distance={6} />

      <Suspense fallback={null}>
        <Environment preset="warehouse" background={false} />
        <Room />
        <NameBehind />
        {HOTSPOTS.map((h) => (
          <HotspotMarker key={h.id} hotspot={h} />
        ))}
        <Preload all />
      </Suspense>

      <CameraRig progressRef={progressRef} pointerRef={pointerRef} />
    </Canvas>
  );
}
