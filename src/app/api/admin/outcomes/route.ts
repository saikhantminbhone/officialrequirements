import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth";
import { moderateOutcome } from "@/lib/outcomes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin moderation: approve (pending → public) or reject (delete) an outcome.
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const { id, action } = (await req.json().catch(() => ({}))) as { id?: string; action?: string };
  if (!id || (action !== "approve" && action !== "reject")) {
    return NextResponse.json({ ok: false, error: "id and action (approve|reject) required" }, { status: 400 });
  }
  const ok = await moderateOutcome(id, action);
  return NextResponse.json({ ok });
}
