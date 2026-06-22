import { NextRequest } from "next/server";

// Cron auth. Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` when
// CRON_SECRET is set in the project env. We also accept `?secret=` for manual
// triggering from the admin. No secret configured → only allow in dev.
export function isCronAuthed(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  const q = new URL(req.url).searchParams.get("secret");
  return q === secret;
}

// Freshness thresholds (deterministic — the "smart without AI" part).
export const FRESHNESS = {
  WARN_DAYS: 90, // surfaces in the re-verification queue
  STALE_DAYS: 180, // auto-unpublished until a human re-verifies
};
