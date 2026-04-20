import { ImageResponse } from "next/og";

/**
 * Default Open Graph image for the site root. Edge-runtime `ImageResponse`
 * keeps cold-start negligible and avoids shipping a 1200x630 PNG in git.
 *
 * Brand: ivory background, black type, blood-red accent — same tokens as
 * the site so the OG matches what people land on.
 */

export const runtime = "edge";
export const alt = "Camille Saquet — portfolio cybersécurité · red team · pentest";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "80px",
        background: "#FAFAF7",
        color: "#0A0A0A",
        fontFamily: "ui-serif, Georgia, serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#6B6B66",
          }}
        >
          — portfolio · cybersécurité
        </div>
        <div
          style={{
            fontSize: 160,
            lineHeight: 0.9,
            fontWeight: 400,
            letterSpacing: -4,
          }}
        >
          Camille
        </div>
        <div
          style={{
            fontSize: 160,
            lineHeight: 0.9,
            fontWeight: 400,
            letterSpacing: -4,
          }}
        >
          Saquet
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          borderLeft: "4px solid #8B1A1A",
          paddingLeft: 24,
        }}
      >
        <div style={{ fontSize: 42, lineHeight: 1.15, maxWidth: 900 }}>
          Cybersécurité — red team, pentest, audit.
        </div>
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 22,
            color: "#6B6B66",
          }}
        >
          Alternance 3 ans · Ingénieur Cyberdéfense · Sept. 2026
        </div>
      </div>
    </div>,
    size,
  );
}
