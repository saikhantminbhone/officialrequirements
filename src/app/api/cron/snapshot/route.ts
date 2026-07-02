import { NextRequest, NextResponse } from "next/server";
import { isCronAuthed } from "@/lib/cron";
import { withCronStatus } from "@/lib/cron-status";
import { saveSnapshot } from "@/lib/knowledge";
import { ensureQuarterSnapshot } from "@/lib/quarterly";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Daily knowledge snapshot — records totals so the dashboard can show growth.
export async function GET(req: NextRequest) {
  if (!isCronAuthed(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(
    await withCronStatus("snapshot", async () => {
      const [snap, quarter] = await Promise.all([saveSnapshot(), ensureQuarterSnapshot()]);
      return { ok: true, ...snap, quarterSnapshot: quarter };
    })
  );
}
