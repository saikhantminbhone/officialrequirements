import { NextRequest, NextResponse } from "next/server";
import { isCronAuthed } from "@/lib/cron";
import { withCronStatus } from "@/lib/cron-status";
import { runDigest } from "@/lib/digest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Weekly SEO digest — compiled from the other crons' R2 reports, emailed to
// ADMIN_EMAIL when Resend is configured.
export async function GET(req: NextRequest) {
  if (!isCronAuthed(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const digest = await runDigest();
  return NextResponse.json(await withCronStatus("digest", async () => ({ ok: true, ...digest })));
}
