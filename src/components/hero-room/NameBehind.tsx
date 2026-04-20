"use client";

import { Text } from "@react-three/drei";

/**
 * "CAMILLE SAQUET" rendered as two stacked flat 3D text meshes, positioned
 * behind the room. Uses drei's <Text> (troika-three-text SDF under the hood)
 * so it stays crisp at any zoom level as the camera dollies in.
 *
 * Font is self-hosted at /fonts/instrument-serif.woff2 to stay compatible
 * with our strict CSP (connect-src 'self' — no third-party font fetches).
 */
export function NameBehind() {
  return (
    <group position={[0, 1.5, -3.2]}>
      <Text
        font="/fonts/instrument-serif.woff2"
        fontSize={1.2}
        color="#0A0A0A"
        anchorX="center"
        anchorY="middle"
        position={[0, 0.65, 0]}
        letterSpacing={-0.02}
      >
        CAMILLE
      </Text>
      <Text
        font="/fonts/instrument-serif.woff2"
        fontSize={1.2}
        color="#0A0A0A"
        anchorX="center"
        anchorY="middle"
        position={[0, -0.65, 0]}
        letterSpacing={-0.02}
      >
        SAQUET
      </Text>
    </group>
  );
}
