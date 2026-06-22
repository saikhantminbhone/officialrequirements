import { buildSearchIndex } from "@/lib/search-index";

// Static, cached search index. No database or search server — the whole index
// is a JSON document the browser fetches once. Revalidated daily so new pages
// appear without a redeploy.
export const dynamic = "force-static";
export const revalidate = 86400;

export async function GET() {
  const index = await buildSearchIndex();
  return Response.json(
    { index, updatedAt: new Date().toISOString().slice(0, 10) },
    { headers: { "cache-control": "public, max-age=3600, stale-while-revalidate=86400" } }
  );
}
