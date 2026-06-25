import { NextRequest, NextResponse } from "next/server";
import { isCronAuthed } from "@/lib/cron";
import { withCronStatus } from "@/lib/cron-status";
import { runDiscovery } from "@/lib/discovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Scheduled source auto-discovery — spiders trusted seeds, quality-gates the
// outbound links, and adds new official sources to the registry without a human.
export async function GET(req: NextRequest) {
  if (!isCronAuthed(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await withCronStatus("discover", async () => ({ ok: true, ...(await runDiscovery()) })));
}
