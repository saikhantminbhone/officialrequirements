import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth";
import { runMaintain, runWatchSources } from "@/lib/maintenance";
import { runGsc } from "@/lib/gsc";
import { runCwv } from "@/lib/cwv";
import { runFx } from "@/lib/fx";
import { runCrawl } from "@/lib/crawl";
import { runIndexNow } from "@/lib/indexnow";
import { runFactCheck } from "@/lib/factcheck";
import { harvestTrends } from "@/lib/trends";
import { runDiscovery } from "@/lib/discovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Heavy jobs fetch many external sources — give them room (Vercel Pro allows 300s).
// Without this, a long crawl/source-watch hits the limit and Vercel returns a
// 500 with an empty body (the "Unexpected end of JSON input" the UI showed).
export const maxDuration = 300;

// Admin "Run now" trigger for the maintenance jobs (so the operator can run the
// freshness pass or source watch on demand, gated by the admin session rather
// than the cron secret).
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const job = new URL(req.url).searchParams.get("job");
  // Always return JSON — even on failure — so the admin UI shows the real reason
  // instead of "Unexpected end of JSON input".
  try {
    if (job === "watch") return NextResponse.json({ ok: true, ...(await runWatchSources()) });
    if (job === "gsc") return NextResponse.json({ ok: true, ...(await runGsc()) });
    if (job === "cwv") return NextResponse.json({ ok: true, ...(await runCwv()) });
    if (job === "fx") return NextResponse.json(await runFx());
    if (job === "crawl") return NextResponse.json({ ok: true, ...(await runCrawl(10)) });
    if (job === "indexnow") {
      const scope = new URL(req.url).searchParams.get("scope") === "changed" ? "changed" : "all";
      return NextResponse.json(await runIndexNow(scope));
    }
    if (job === "factcheck") return NextResponse.json({ ok: true, ...(await runFactCheck(25)) });
    if (job === "trends") return NextResponse.json({ ok: true, ...(await harvestTrends(60)) });
    if (job === "discover") return NextResponse.json({ ok: true, ...(await runDiscovery()) });
    return NextResponse.json({ ok: true, ...(await runMaintain()) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "job failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 200 });
  }
}
