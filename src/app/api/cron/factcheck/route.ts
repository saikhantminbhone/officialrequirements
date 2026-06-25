import { NextRequest, NextResponse } from "next/server";
import { isCronAuthed } from "@/lib/cron";
import { withCronStatus } from "@/lib/cron-status";
import { runFactCheck } from "@/lib/factcheck";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Scheduled cross-source fact-check. Corroborates figures across official sources
// and promotes agreeing records to "auto-corroborated"; flags conflicts for review.
export async function GET(req: NextRequest) {
  if (!isCronAuthed(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const limit = Number(new URL(req.url).searchParams.get("limit") || "25");
  const report = await runFactCheck(Number.isFinite(limit) ? limit : 25);
  return NextResponse.json(await withCronStatus("factcheck", async () => ({ ok: true, ...report })));
}
