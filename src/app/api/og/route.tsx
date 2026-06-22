import { ImageResponse } from "next/og";

export const runtime = "edge";

// Dynamic Open Graph card. Reads ?title= and ?tag= so each page can render a
// branded, on-topic social/AI preview image (same idea as OfficialSalary's /api/og).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || "Study-abroad requirements you can trust").slice(0, 120);
  const tag = (searchParams.get("tag") || "Visa · Scholarship · Admission").slice(0, 60);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #eef6ff 0%, #ffffff 60%)",
          padding: "64px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", color: "#1e40af", fontSize: 34, fontWeight: 700 }}>
          OfficialRequirements
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 60, fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>{title}</div>
          <div style={{ fontSize: 30, color: "#2563eb" }}>{tag}</div>
        </div>
        <div style={{ fontSize: 24, color: "#64748b" }}>
          Independent · Sourced · Date-verified · Not a government site
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
