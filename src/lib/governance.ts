import { getJson, putJsonSafe } from "@/lib/r2";
import type { CrawlSource } from "@/lib/sources";

// ─────────────────────────────────────────────────────────────────────────
// Source governance — the human override layer over the autonomous pipeline.
//
// Automation keeps running, but an operator can block, pause, delete (suppress)
// or pin/override any source. The registry + crawler + source-watch all obey
// this state, so a human stays in control without turning automation off.
//   • block    — never crawl, watch, or auto-add (domain or exact URL)
//   • pause    — keep listed but skip in automation (temporary)
//   • suppress — remove from the registry entirely (incl. a seed source)
//   • pin      — force-keep a source even if the quality gate would reject it
//                (manual override / "overwrite the source")
// ─────────────────────────────────────────────────────────────────────────

export type SourceAction = "block" | "unblock" | "pause" | "resume" | "suppress" | "restore" | "pin" | "unpin";

export interface GovernanceState {
  blocked: string[];
  paused: string[];
  suppressed: string[];
  pinned: CrawlSource[];
  updatedAt: string;
}

const KEY = "data/sources/governance.json";
const EMPTY: GovernanceState = { blocked: [], paused: [], suppressed: [], pinned: [], updatedAt: "" };

export async function loadGovernance(): Promise<GovernanceState> {
  const g = await getJson<GovernanceState>(KEY);
  return g ? { ...EMPTY, ...g } : { ...EMPTY };
}

function hostOf(u: string): string {
  try {
    return new URL(u).hostname.toLowerCase();
  } catch {
    return "";
  }
}

/** An entry matches a URL by exact URL, or by domain (entry with no path). */
export function matches(url: string, list: string[]): boolean {
  const h = hostOf(url);
  return list.some((e) => e === url || (e !== "" && !e.includes("/") && (h === e || h.endsWith(`.${e}`))));
}

export async function applySourceAction(action: SourceAction, url: string, meta?: CrawlSource): Promise<GovernanceState> {
  const s = await loadGovernance();
  const without = (arr: string[]) => arr.filter((x) => x !== url);
  switch (action) {
    case "block":
      s.blocked = [...new Set([...s.blocked, url])];
      s.paused = without(s.paused);
      break;
    case "unblock":
      s.blocked = without(s.blocked);
      break;
    case "pause":
      s.paused = [...new Set([...s.paused, url])];
      break;
    case "resume":
      s.paused = without(s.paused);
      break;
    case "suppress":
      s.suppressed = [...new Set([...s.suppressed, url])];
      break;
    case "restore":
      s.suppressed = without(s.suppressed);
      break;
    case "pin":
      if (meta) s.pinned = [...s.pinned.filter((p) => p.url !== url), meta];
      break;
    case "unpin":
      s.pinned = s.pinned.filter((p) => p.url !== url);
      break;
  }
  s.updatedAt = new Date().toISOString();
  await putJsonSafe(KEY, s);
  return s;
}
