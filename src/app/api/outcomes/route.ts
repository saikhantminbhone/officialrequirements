import { NextRequest, NextResponse } from "next/server";
import { submitOutcome } from "@/lib/outcomes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public endpoint: accept a user-submitted admission/visa outcome. It is stored
// as PENDING and never shown until an admin approves it (UGC moderation). The
// honeypot + hard validation in outcomes-core reject spam and garbage.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, errors: ["invalid JSON"] }, { status: 400 });
  }
  const result = await submitOutcome((body ?? {}) as Record<string, unknown>);
  if (!result.ok) {
    // Honeypot hits look like success to the bot but store nothing.
    if (result.errors?.includes("spam")) return NextResponse.json({ ok: true });
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
