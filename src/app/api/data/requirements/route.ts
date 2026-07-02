import { NextResponse } from "next/server";
import { buildOpenData } from "@/lib/open-data";

export const runtime = "nodejs";
export const revalidate = 86400;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://officialrequirements.com";

// Open dataset — JSON distribution. License: CC BY 4.0 with link attribution.
export async function GET() {
  const { rows, generatedAt } = await buildOpenData();
  return NextResponse.json(
    {
      name: "Student visa requirements by nationality and destination",
      license: "https://creativecommons.org/licenses/by/4.0/",
      attribution: `OfficialRequirements — ${SITE}`,
      generatedAt,
      count: rows.length,
      data: rows,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
