import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth";
import { getJson, putJson } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Human re-verification: an operator has checked a destination's figures against
// the official source and confirms them. Flips the destination to human-verified
// and bumps the date — without changing any value. This is what makes the green
// "Verified by a person" label truthful.
interface DestOverride {
  toolDefaults?: Record<string, number | string>;
  lastVerified?: string;
  note?: string;
  verification?: "human-verified" | "machine-compiled";
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { vertical, destination } = (await req.json().catch(() => ({}))) as { vertical?: string; destination?: string };
  if (!destination) return NextResponse.json({ ok: false, error: "Missing destination" }, { status: 400 });

  const prefix = vertical === "university" ? "data/overrides/university" : "data/overrides/visa";
  const key = `${prefix}/${destination}.json`;
  const existing = (await getJson<DestOverride>(key)) ?? {};
  const today = new Date().toISOString().slice(0, 10);
  await putJson(key, {
    ...existing,
    lastVerified: today,
    verification: "human-verified",
    note: `Human-verified against the official source on ${today}.`,
  });
  return NextResponse.json({ ok: true, destination, verifiedOn: today, note: "Marked verified. Rebuild to bake into static pages." });
}
