import { NextRequest, NextResponse } from "next/server";
import { isCronAuthed } from "@/lib/cron";
import { withCronStatus } from "@/lib/cron-status";
import { runIndexStatus } from "@/lib/index-status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Scheduled index-coverage sweep — inspects a batch of sitemap URLs via the
// URL Inspection API and stores per-URL coverage in R2 for /ops/seo.
export async function GET(req: NextRequest) {
  if (!isCronAuthed(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const report = await runIndexStatus();
  return NextResponse.json(await withCronStatus("index-status", async () => ({ ok: report.connected, ...report })));
}
