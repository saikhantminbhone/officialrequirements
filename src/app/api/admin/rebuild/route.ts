import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth";

export const runtime = "nodejs";

// The admin "Rebuild" button. Pings the Vercel deploy hook so new pages/data
// (e.g. a new nationality row or R2 record) are baked into a fresh static build.
// Runtime ad/affiliate changes do NOT need this — they take effect within ~60s.
export async function POST() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook) {
    return NextResponse.json({ ok: false, error: "VERCEL_DEPLOY_HOOK_URL not set" }, { status: 400 });
  }
  const res = await fetch(hook, { method: "POST" });
  return NextResponse.json({ ok: res.ok, status: res.status });
}
