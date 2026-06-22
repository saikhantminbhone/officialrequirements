import { NextRequest, NextResponse } from "next/server";
import { isCronAuthed } from "@/lib/cron";
import { runWatchSources } from "@/lib/maintenance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Scheduled source-change watcher (deterministic content hashing, no AI).
export async function GET(req: NextRequest) {
  if (!isCronAuthed(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const report = await runWatchSources();
  return NextResponse.json({ ok: true, ...report });
}
