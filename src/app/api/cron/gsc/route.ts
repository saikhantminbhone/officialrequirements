import { NextRequest, NextResponse } from "next/server";
import { isCronAuthed } from "@/lib/cron";
import { runGsc } from "@/lib/gsc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Scheduled GSC harvest — pulls Search Console performance + % tier-1 traffic
// into R2 for the admin SEO dashboard.
export async function GET(req: NextRequest) {
  if (!isCronAuthed(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const report = await runGsc();
  return NextResponse.json({ ok: report.connected, ...report });
}
