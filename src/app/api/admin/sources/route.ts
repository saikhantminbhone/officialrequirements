import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth";
import { applySourceAction, type SourceAction } from "@/lib/governance";
import { classifySource } from "@/lib/source-trust";
import type { CrawlSource } from "@/lib/sources";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIONS: SourceAction[] = ["block", "unblock", "pause", "resume", "suppress", "restore", "pin", "unpin"];

// Human governance over sources — block / pause / delete / pin (override).
// Automation keeps running but obeys this state.
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    action?: SourceAction;
    url?: string;
    country?: string;
    category?: CrawlSource["category"];
    label?: string;
  };
  const { action, url } = body;
  if (!action || !ACTIONS.includes(action) || !url) {
    return NextResponse.json({ ok: false, error: "action and url required" }, { status: 400 });
  }
  // For "pin" (manual override / add), build the source record. Pinning forces it
  // into the registry even if the auto-grade would reject — that's the override.
  let meta: CrawlSource | undefined;
  if (action === "pin") {
    try {
      meta = {
        url,
        country: (body.country || "intl").toLowerCase().slice(0, 4),
        category: body.category || "general",
        label: body.label || new URL(url).hostname,
      };
    } catch {
      return NextResponse.json({ ok: false, error: "invalid url" }, { status: 400 });
    }
  }
  const state = await applySourceAction(action, url, meta);
  return NextResponse.json({ ok: true, tier: classifySource(url).tier, counts: { blocked: state.blocked.length, paused: state.paused.length, suppressed: state.suppressed.length, pinned: state.pinned.length } });
}
