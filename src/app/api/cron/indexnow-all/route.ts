import { NextRequest, NextResponse } from "next/server";
import { isCronAuthed } from "@/lib/cron";
import { runIndexNow } from "@/lib/indexnow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Weekly full IndexNow submission — pushes EVERY indexable (quality-gated) URL to
// Bing/Yandex/etc. so new pages (guides, universities, reports) get discovered
// even if their source never "changed". Daily /api/cron/indexnow handles deltas.
export async function GET(req: NextRequest) {
  if (!isCronAuthed(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await runIndexNow("all"));
}
