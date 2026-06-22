import { NextRequest, NextResponse } from "next/server";
import { isCronAuthed } from "@/lib/cron";
import { runMaintain } from "@/lib/maintenance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Scheduled freshness pass (deterministic, no AI). See lib/maintenance.ts.
export async function GET(req: NextRequest) {
  if (!isCronAuthed(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const report = await runMaintain();
  return NextResponse.json({ ok: true, ...report });
}
