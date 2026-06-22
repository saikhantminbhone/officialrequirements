import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth";
import { getJson, putJson } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Human-approve step. An admin reviews a crawled candidate and applies it. This
// is the ONLY path that changes YMYL data, and it's gated by the admin session.
// It writes a destination-level override (applies to every nationality page of
// that destination) and bumps the verification date.
type Body = {
  vertical: "visa" | "university";
  destination: string;
  field: string; // e.g. "blockedAccountAmount", "visaFee", "processingWeeks", "blockedAccountCurrency"
  value: number;
  currency?: string | null;
};

interface DestOverride {
  toolDefaults?: Record<string, number | string>;
  lastVerified?: string;
  note?: string;
  verification?: "human-verified" | "machine-compiled";
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !body.destination || !body.field || typeof body.value !== "number") {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  const prefix = body.vertical === "university" ? "data/overrides/university" : "data/overrides/visa";
  const key = `${prefix}/${body.destination}.json`;

  const existing = (await getJson<DestOverride>(key)) ?? { toolDefaults: {} };
  const toolDefaults = { ...(existing.toolDefaults ?? {}) };
  toolDefaults[body.field] = body.value;
  if (body.currency) toolDefaults["blockedAccountCurrency"] = body.currency;

  const today = new Date().toISOString().slice(0, 10);
  const override: DestOverride = {
    ...existing,
    toolDefaults,
    lastVerified: today,
    // A human reviewed and approved this in the admin → it is now human-verified.
    verification: "human-verified",
    note: `Approved crawled value: ${body.field} = ${body.value}${body.currency ? " " + body.currency : ""} (admin-verified ${today}).`,
  };
  await putJson(key, override);

  return NextResponse.json({ ok: true, applied: { destination: body.destination, field: body.field, value: body.value }, note: "Override saved. Rebuild to bake it into static pages." });
}
