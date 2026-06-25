import { NextRequest, NextResponse } from "next/server";
import { isCronAuthed } from "@/lib/cron";
import { withCronStatus } from "@/lib/cron-status";
import { runFx } from "@/lib/fx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Refresh ECB FX rates into R2 (powers home-currency figures + reports).
export async function GET(req: NextRequest) {
  if (!isCronAuthed(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const result = await runFx();
  return NextResponse.json(await withCronStatus("fx", async () => (result)));
}
