import { ImageResponse } from "next/og";

export const alt = "VektorOps — Pelaporan Pest Control RSU Kota Tangerang Selatan";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#f8fafc",
          padding: "60px 70px",
          fontFamily: "system-ui, sans-serif",
          border: "16px solid #c8102e",
        }}
      >
        {/* Top bar with badges */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                backgroundColor: "rgba(200, 16, 46, 0.12)",
                border: "2px solid rgba(200, 16, 46, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#c8102e",
                fontWeight: 900,
                fontSize: "26px",
              }}
            >
              M
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
                PT. MOIKO MITSUBA INDONESIA
              </span>
              <span style={{ fontSize: "15px", color: "#64748b", fontWeight: 500 }}>
                Pest Control &amp; Anti Rayap
              </span>
            </div>
          </div>

          <div
            style={{
              padding: "10px 20px",
              borderRadius: "9999px",
              backgroundColor: "rgba(200, 16, 46, 0.1)",
              border: "1.5px solid rgba(200, 16, 46, 0.3)",
              color: "#c8102e",
              fontSize: "15px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Laporan Resmi RS
          </div>
        </div>

        {/* Center Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", margin: "40px 0" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#c8102e", textTransform: "uppercase", letterSpacing: "2px" }}>
            Sistem Pelaporan Pengendalian Vektor Digital
          </div>
          <div style={{ fontSize: "52px", fontWeight: 900, color: "#0f172a", lineHeight: 1.15, letterSpacing: "-1.5px" }}>
            RSU KOTA TANGERANG SELATAN
          </div>
          <div style={{ fontSize: "22px", color: "#334155", maxWidth: "900px", lineHeight: 1.4 }}>
            Bukti Pelaksanaan Pekerjaan, Temuan Hama, Penggunaan Chemical, dan Rekapitulasi Terpadu.
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid #e2e8f0",
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", gap: "28px" }}>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
              Input Lapangan Mobile
            </span>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
              Rekap Realtime
            </span>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
              Ekspor PDF &amp; XLSX
            </span>
          </div>

          <div style={{ fontSize: "16px", fontWeight: 800, color: "#c8102e" }}>
            VektorOps Platform
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
