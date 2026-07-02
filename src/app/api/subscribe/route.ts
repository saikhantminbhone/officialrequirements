import { NextRequest, NextResponse } from "next/server";
import { addSubscriber } from "@/lib/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public endpoint: subscribe an email to a destination's change alerts.
// Spam defenses: honeypot field, basic validation, idempotent adds, list cap.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; destination?: string; website?: string };
  // Honeypot — real users never fill "website".
  if (body.website) return NextResponse.json({ ok: true });
  if (!body.email || !body.destination) {
    return NextResponse.json({ ok: false, error: "Missing email or destination" }, { status: 400 });
  }
  const result = await addSubscriber(body.destination, body.email);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
