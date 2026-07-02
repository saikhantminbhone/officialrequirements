import { NextResponse } from "next/server";
import { destinationMetrics, eur } from "@/lib/reports";

export const runtime = "nodejs";
export const revalidate = 3600;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://officialrequirements.com";

// Embeddable proof-of-funds table (iframe target). Served as a bare HTML
// document (no app shell) so it renders cleanly inside any site. The widget
// loader (/widget.js) or a manual iframe points here. noindex — the canonical
// content lives on the report page; this exists for distribution + backlinks.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 10, 3), 25);

  const { rows, fxUpdatedAt } = await destinationMetrics();
  const top = rows
    .filter((r) => r.proofEur != null)
    .sort((a, b) => (a.proofEur ?? 0) - (b.proofEur ?? 0))
    .slice(0, limit);

  const trs = top
    .map(
      (r, i) => `<tr>
        <td class="n">${i + 1}</td>
        <td><a href="${SITE}/study/${r.code}?utm_source=widget" target="_blank" rel="noopener">${r.name}</a></td>
        <td class="v">${eur(r.proofEur)}</td>
      </tr>`
    )
    .join("");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Student visa proof of funds by country</title>
<style>
  :root{color-scheme:light}
  body{margin:0;font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#0f172a;background:#fff}
  .w{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden}
  h2{font-size:15px;margin:0;padding:12px 14px;border-bottom:1px solid #e2e8f0;background:#f8fafc}
  table{width:100%;border-collapse:collapse}
  td{padding:8px 14px;border-bottom:1px solid #f1f5f9}
  td.n{color:#94a3b8;width:2em}
  td.v{text-align:right;font-variant-numeric:tabular-nums;font-weight:600}
  a{color:#1d4ed8;text-decoration:none} a:hover{text-decoration:underline}
  .src{padding:10px 14px;font-size:12px;color:#64748b}
</style></head>
<body><div class="w">
  <h2>Cheapest student-visa proof of funds (per year)</h2>
  <table>${trs}</table>
  <div class="src">Official figures, ECB rates (${fxUpdatedAt ? fxUpdatedAt.slice(0, 10) : "latest"}) ·
    Data: <a href="${SITE}/reports/cheapest-student-visa-proof-of-funds?utm_source=widget" target="_blank" rel="noopener">OfficialRequirements</a></div>
</div></body></html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      // Explicitly allow embedding anywhere — that's the point.
      "Content-Security-Policy": "frame-ancestors *",
    },
  });
}
