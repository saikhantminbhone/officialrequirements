import { NextResponse } from "next/server";

export const runtime = "nodejs";

// The password login was replaced by Auth.js Google OAuth. Sign in at /ops/login.
export async function POST() {
  return NextResponse.json(
    { ok: false, error: "Password login removed — sign in with Google at /ops/login." },
    { status: 410 }
  );
}
