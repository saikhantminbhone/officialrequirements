import { detectGaps, type Gap } from "@/lib/gap-detector";
import { extractFromSource } from "@/lib/extract/source";
import { getVisaRecords, getUniversityRecords } from "@/lib/req-data";
import { putJson, r2Configured } from "@/lib/r2";
import type { RequirementRecord } from "@/lib/req-data/types";

// ─────────────────────────────────────────────────────────────────────────
// Crawl orchestrator. The self-healing loop: find gaps → crawl each source →
// extract candidate values → compare to what we have → write a human-review
// queue to R2. It NEVER writes to the live dataset itself (requirements are
// YMYL — a person approves candidates in the admin before they publish).
// ─────────────────────────────────────────────────────────────────────────

export interface ReviewCandidate {
  field: string;
  value: number;
  currency: string | null;
  unit: string;
  confidence: "high" | "medium" | "low";
  context: string;
  current: number | null;
  status: "matches" | "differs" | "new";
}

export interface ReviewItem {
  recordId: string;
  vertical: "visa" | "university";
  destination: string;
  title: string;
  sourceUrl: string | null;
  missing: string[];
  stale: boolean;
  ageDays: number;
  kind?: string;
  method?: string;
  candidates: ReviewCandidate[];
  note?: string;
}

export interface CrawlReport {
  ranAt: string;
  totals: { gaps: number; crawled: number; candidates: number; unreachable: number };
  items: ReviewItem[];
  renderServiceConfigured: boolean;
}

function currentValue(rec: RequirementRecord | undefined, field: string): number | null {
  if (!rec?.toolDefaults) return null;
  const d = rec.toolDefaults as Record<string, unknown>;
  const v = d[field];
  return typeof v === "number" ? v : null;
}

export async function runCrawl(limit = 15): Promise<CrawlReport> {
  const [gapReport, visa, university] = await Promise.all([detectGaps(), getVisaRecords(), getUniversityRecords()]);
  const byId = new Map<string, RequirementRecord>();
  [...visa, ...university].forEach((r) => byId.set(r.id, r));

  const targets: Gap[] = gapReport.gaps.filter((g) => g.sourceUrl).slice(0, limit);
  const items: ReviewItem[] = [];
  let unreachable = 0;
  let candidateCount = 0;

  for (const gap of targets) {
    const res = await extractFromSource(gap.sourceUrl!);
    if (res.kind === "unreachable") unreachable++;
    const rec = byId.get(gap.recordId);

    const candidates: ReviewCandidate[] = res.candidates.map((c) => {
      const current = currentValue(rec, c.field);
      const status: ReviewCandidate["status"] =
        current == null ? "new" : Math.abs(current - c.value) <= Math.max(1, current * 0.02) ? "matches" : "differs";
      return {
        field: c.field,
        value: c.value,
        currency: c.currency,
        unit: c.unit,
        confidence: c.confidence,
        context: c.context,
        current,
        status,
      };
    });
    candidateCount += candidates.length;

    items.push({
      recordId: gap.recordId,
      vertical: gap.vertical,
      destination: gap.destination,
      title: gap.title,
      sourceUrl: gap.sourceUrl,
      missing: gap.missing,
      stale: gap.stale,
      ageDays: gap.ageDays,
      kind: res.kind,
      method: res.method,
      candidates,
      note: res.note,
    });
  }

  const report: CrawlReport = {
    ranAt: new Date().toISOString(),
    totals: { gaps: gapReport.gaps.length, crawled: targets.length, candidates: candidateCount, unreachable },
    items,
    renderServiceConfigured: Boolean(process.env.RENDER_SERVICE_URL),
  };

  if (r2Configured) await putJson("seo/extraction-review.json", report);
  return report;
}
