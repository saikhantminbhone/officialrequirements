import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth";
import { putJson } from "@/lib/r2";
import { saveRuntimeConfig } from "@/lib/config-loader";
import { requirementRecordSchema, scholarshipRecordSchema } from "@/lib/req-data/schema";
import type { RuntimeConfig } from "@/lib/config";

export const runtime = "nodejs";

// The admin write endpoint. Writes runtime config or a (validated) data record
// to Cloudflare R2. For YMYL data we validate before persisting — the
// human-verify-before-publish guardrail.
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  try {
    switch (body.type) {
      case "config": {
        await saveRuntimeConfig(body.config as RuntimeConfig);
        return NextResponse.json({ ok: true });
      }
      case "visa": {
        const parsed = requirementRecordSchema.parse(body.record);
        await putJson(`data/visa/${parsed.id}.json`, parsed);
        return NextResponse.json({ ok: true, id: parsed.id });
      }
      case "scholarship": {
        const parsed = scholarshipRecordSchema.parse(body.record);
        await putJson(`data/scholarship/${parsed.id}.json`, parsed);
        return NextResponse.json({ ok: true, id: parsed.id });
      }
      default:
        return NextResponse.json({ ok: false, error: "Unknown type" }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Validation failed";
    return NextResponse.json({ ok: false, error: message }, { status: 422 });
  }
}
