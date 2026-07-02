import { NextResponse } from "next/server";
import { buildOpenData, toCsv } from "@/lib/open-data";

export const runtime = "nodejs";
export const revalidate = 86400;

// Open dataset — CSV distribution (spreadsheet-friendly for journalists).
export async function GET() {
  const { rows } = await buildOpenData();
  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="student-visa-requirements.csv"',
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
