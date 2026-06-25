import { NextRequest, NextResponse } from "next/server";
import { isCronAuthed } from "@/lib/cron";
import { withCronStatus } from "@/lib/cron-status";
import { harvestTrends } from "@/lib/trends";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Scheduled trending-keyword harvest — pulls live query expansions from Google
// autocomplete, filters/ranks them, and stores a report in R2 for the admin.
export async function GET(req: NextRequest) {
  if (!isCronAuthed(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const limit = Number(new URL(req.url).searchParams.get("limit") || "60");
  const report = await harvestTrends(Number.isFinite(limit) ? limit : 60);
  return NextResponse.json(await withCronStatus("trends", async () => ({ ok: true, ...report })));
}
