"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

const GLB_PATH = "/models/hacker-room.glb";
const DRACO_PATH = "/draco/";

// Accent red for the signature object override — matches our brand accent
// exactly (globals.css --accent = oklch equivalent of #8B1A1A).
const ACCENT_HEX = 0x8b1a1a;

/**
 * Loads the hacker-room GLB (Draco-compressed, WebP textures) and returns
 * a cloned scene graph so the source primitive can be mounted multiple
 * times without cross-instance mutation.
 *
 * Side effects on the cloned scene:
 *   - Every mesh gets `castShadow = true` and `receiveShadow = true`.
 *   - A single mesh gets its material swapped to an unlit accent-red one,
 *     giving the scene a brand-aligned signature detail. We pick the
 *     mesh with the lowest POSITION Y value and smallest bounding box —
 *     typically a small object on the floor/desk, visually punctual.
 */
export function Room() {
  const { scene } = useGLTF(GLB_PATH, DRACO_PATH);

  // Clone once per mount so effects on materials don't leak to the cache.
  const cloned = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    const meshes: THREE.Mesh[] = [];
    cloned.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        meshes.push(mesh);
      }
    });

    // Pick accent target: smallest mesh by bounding-box volume, excluding
    // the floor / walls (large meshes). Heuristic but deterministic.
    const scored = meshes.map((m) => {
      const box = new THREE.Box3().setFromObject(m);
      const size = new THREE.Vector3();
      box.getSize(size);
      return { mesh: m, volume: size.x * size.y * size.z };
    });
    scored.sort((a, b) => a.volume - b.volume);
    const accent = scored.find((s) => s.volume > 0.0005 && s.volume < 0.02)?.mesh;
    if (accent) {
      accent.material = new THREE.MeshStandardMaterial({
        color: ACCENT_HEX,
        emissive: ACCENT_HEX,
        emissiveIntensity: 0.35,
        roughness: 0.5,
        metalness: 0.1,
      });
    }
  }, [cloned]);

  return <primitive object={cloned} />;
}

// Warm the GLTF cache during idle time so the first Canvas mount is instant.
useGLTF.preload(GLB_PATH, DRACO_PATH);
