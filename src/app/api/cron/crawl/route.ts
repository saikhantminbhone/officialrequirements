import { NextRequest, NextResponse } from "next/server";
import { isCronAuthed } from "@/lib/cron";
import { runCrawl } from "@/lib/crawl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Scheduled self-healing crawl: find gaps, crawl sources, extract candidates,
// write a human-review queue to R2. Never publishes data automatically (YMYL).
export async function GET(req: NextRequest) {
  if (!isCronAuthed(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const limit = Number(new URL(req.url).searchParams.get("limit") || "15");
  const report = await runCrawl(Number.isFinite(limit) ? limit : 15);
  return NextResponse.json({ ok: true, ...report });
}
