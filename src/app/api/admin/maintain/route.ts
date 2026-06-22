import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth";
import { runMaintain, runWatchSources } from "@/lib/maintenance";
import { runGsc } from "@/lib/gsc";
import { runCwv } from "@/lib/cwv";
import { runFx } from "@/lib/fx";
import { runCrawl } from "@/lib/crawl";
import { runIndexNow } from "@/lib/indexnow";
import { runFactCheck } from "@/lib/factcheck";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Admin "Run now" trigger for the maintenance jobs (so the operator can run the
// freshness pass or source watch on demand, gated by the admin session rather
// than the cron secret).
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const job = new URL(req.url).searchParams.get("job");
  if (job === "watch") {
    return NextResponse.json({ ok: true, ...(await runWatchSources()) });
  }
  if (job === "gsc") {
    return NextResponse.json({ ok: true, ...(await runGsc()) });
  }
  if (job === "cwv") {
    return NextResponse.json({ ok: true, ...(await runCwv()) });
  }
  if (job === "fx") {
    return NextResponse.json(await runFx());
  }
  if (job === "crawl") {
    return NextResponse.json({ ok: true, ...(await runCrawl(15)) });
  }
  if (job === "indexnow") {
    const scope = new URL(req.url).searchParams.get("scope") === "all" ? "all" : "all";
    return NextResponse.json(await runIndexNow(scope));
  }
  if (job === "factcheck") {
    return NextResponse.json({ ok: true, ...(await runFactCheck(25)) });
  }
  return NextResponse.json({ ok: true, ...(await runMaintain()) });
}
