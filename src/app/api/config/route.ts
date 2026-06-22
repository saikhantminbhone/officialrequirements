import { NextResponse } from "next/server";
import { loadRuntimeConfig } from "@/lib/config-loader";

// Public runtime config endpoint. <AdSlot/> and <AffiliateBlock/> read this at
// load so ads/affiliates can be toggled without a rebuild. Edge-cached 60s.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const config = await loadRuntimeConfig();
  return NextResponse.json(config, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
