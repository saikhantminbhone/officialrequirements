import { NextRequest, NextResponse } from "next/server";
import { isCronAuthed } from "@/lib/cron";
import { runIndexNow } from "@/lib/indexnow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Scheduled IndexNow ping. Default scope "changed" (pages whose source moved);
// pass ?scope=all to resubmit the whole indexable set (e.g. after a big launch).
export async function GET(req: NextRequest) {
  if (!isCronAuthed(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const scope = new URL(req.url).searchParams.get("scope") === "all" ? "all" : "changed";
  const report = await runIndexNow(scope);
  return NextResponse.json(report);
}
