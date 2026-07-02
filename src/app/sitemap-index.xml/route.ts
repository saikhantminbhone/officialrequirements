import { NextResponse } from "next/server";
import { SITEMAP_SECTIONS } from "../sitemap";

export const revalidate = 3600;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://officialrequirements.com";

// Sitemap index pointing at the section sitemaps. Lives at /sitemap-index.xml
// because Next reserves (but in v16 does not actually serve) /sitemap.xml when
// generateSitemaps is used — next.config 301-redirects /sitemap.xml here, so
// the canonical URL submitted in GSC/BWT keeps working.
export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${SITEMAP_SECTIONS.map((s) => `  <sitemap><loc>${SITE}/sitemap/${s}.xml</loc></sitemap>`).join("\n")}
</sitemapindex>`;
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
