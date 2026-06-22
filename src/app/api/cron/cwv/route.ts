import { NextRequest, NextResponse } from "next/server";
import { isCronAuthed } from "@/lib/cron";
import { runCwv } from "@/lib/cwv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Scheduled Core Web Vitals (CrUX field data) harvest into R2.
export async function GET(req: NextRequest) {
  if (!isCronAuthed(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const report = await runCwv();
  return NextResponse.json({ ok: report.connected, ...report });
}
