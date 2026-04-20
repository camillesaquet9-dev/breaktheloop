"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Drives the camera every frame:
 *   - wide 3/4 shot when idle, fixed at [WIDE_POS] looking at [WIDE_LOOK],
 *   - cursor parallax (±3° lerp) for subtle life,
 *   - scroll-driven dolly from WIDE → CLOSE as the user scrolls the hero
 *     section (we listen to `scrollY` via a ref set by the parent so this
 *     stays DOM-free at the R3F level).
 *
 * The parent passes a `progressRef` (0..1) so React re-renders don't flush
 * the whole tree on every scroll event — we only mutate the camera.
 */
export function CameraRig({
  progressRef,
  pointerRef,
}: {
  readonly progressRef: React.MutableRefObject<number>;
  readonly pointerRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const { camera } = useThree();

  // Waypoints: wide 3/4 overview → close to the central monitors.
  const wideP = useRef(new THREE.Vector3(2.4, 1.9, 3.0));
  const closeP = useRef(new THREE.Vector3(0.4, 1.1, 1.4));
  const wideL = useRef(new THREE.Vector3(0, 1.0, 0));
  const closeL = useRef(new THREE.Vector3(0, 1.0, -0.2));

  const target = useRef(new THREE.Vector3());
  const lookAt = useRef(new THREE.Vector3());

  // Initialise at WIDE so first frame isn't jumpy.
  useEffect(() => {
    camera.position.copy(wideP.current);
    camera.lookAt(wideL.current);
  }, [camera]);

  useFrame((_, delta) => {
    const p = Math.min(1, Math.max(0, progressRef.current));

    // Scroll-driven dolly between wide and close waypoints.
    target.current.lerpVectors(wideP.current, closeP.current, p);
    lookAt.current.lerpVectors(wideL.current, closeL.current, p);

    // Cursor parallax: shift the camera sideways/vertically by a small
    // amount (max ~0.25 world units) based on pointer position in [-1,1].
    const px = pointerRef.current.x;
    const py = pointerRef.current.y;
    target.current.x += px * 0.25;
    target.current.y += -py * 0.12;

    // Frame-rate-independent smoothing.
    const alpha = 1 - 0.001 ** delta;
    camera.position.lerp(target.current, alpha);
    camera.lookAt(lookAt.current);
  });

  return null;
}
