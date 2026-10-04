import { ImageResponse } from "next/og";

export const alt = "Instituto Figura Viva — Gestalt-Terapia & Formação Clínica";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social share card (WhatsApp, Instagram, Facebook, LinkedIn).
 * Generated at build/request time so there is no static asset to keep in sync
 * with the brand — the previous metadata pointed at /og-image.jpg, which never
 * existed in public/ and rendered a broken preview on every share.
 */
export default async function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#1C1A17",
        padding: "72px 80px",
      }}
    >
      {/* Gold rule + eyebrow */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            width: 96,
            height: 4,
            backgroundColor: "#D4AF37",
            marginBottom: 40,
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 24,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#C7BFAE",
          }}
        >
          Ouro Preto do Oeste · RO
        </div>
      </div>

      {/* Wordmark + tagline */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 92,
            fontWeight: 700,
            lineHeight: 1.05,
            color: "#FBF8F1",
            letterSpacing: -2,
          }}
        >
          Instituto Figura Viva
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 34,
            lineHeight: 1.3,
            color: "#D4AF37",
          }}
        >
          Gestalt-Terapia, acolhimento clínico e formação profissional
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid #3A352C",
          paddingTop: 28,
          fontSize: 26,
          color: "#8C8577",
        }}
      >
        <div style={{ display: "flex" }}>figuraviva.com.br</div>
        <div style={{ display: "flex" }}>Encontros que transformam</div>
      </div>
    </div>,
    size,
  );
}
