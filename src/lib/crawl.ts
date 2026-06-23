import { detectGaps, type Gap } from "@/lib/gap-detector";
import { extractFromSource } from "@/lib/extract/source";
import { getVisaRecords, getUniversityRecords } from "@/lib/req-data";
import { putJson, r2Configured } from "@/lib/r2";
import { classifySource, type TrustTier } from "@/lib/source-trust";
import { checkQuality, recommend, type QualityGrade, type Recommendation } from "@/lib/quality";
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
  // Auto-grades (deterministic): quality of the value + recommended action.
  quality: QualityGrade;
  recommendation: Recommendation;
}

export interface ReviewItem {
  recordId: string;
  vertical: "visa" | "university";
  destination: string;
  title: string;
  sourceUrl: string | null;
  // Auto trust grade of the source the candidates came from.
  sourceTrust: { tier: TrustTier; score: number; reasons: string[] };
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
  totals: {
    gaps: number;
    crawled: number;
    candidates: number;
    unreachable: number;
    // Quality/trust roll-up so the admin sees the queue health at a glance.
    readyToApprove: number;
    needsReview: number;
    rejected: number;
    fromOfficialSource: number;
    fromUntrustedSource: number;
  };
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
  let readyToApprove = 0;
  let needsReview = 0;
  let rejected = 0;
  let fromOfficialSource = 0;
  let fromUntrustedSource = 0;

  for (const gap of targets) {
    const res = await extractFromSource(gap.sourceUrl!);
    if (res.kind === "unreachable") unreachable++;
    const rec = byId.get(gap.recordId);

    // Auto trust-check the source URL we pulled these candidates from.
    const trust = classifySource(gap.sourceUrl!);
    if (trust.tier === "official") fromOfficialSource++;
    if (trust.tier === "low") fromUntrustedSource++;

    const candidates: ReviewCandidate[] = res.candidates.map((c) => {
      const current = currentValue(rec, c.field);
      const status: ReviewCandidate["status"] =
        current == null ? "new" : Math.abs(current - c.value) <= Math.max(1, current * 0.02) ? "matches" : "differs";
      // Auto quality-check + combined recommendation (trust × quality × status).
      const quality = checkQuality({ field: c.field, value: c.value, currency: c.currency, confidence: c.confidence, status }).grade;
      const recommendation = recommend({ trustTier: trust.tier, quality, status });
      if (recommendation === "ready-to-approve") readyToApprove++;
      else if (recommendation === "reject") rejected++;
      else needsReview++;
      return {
        field: c.field,
        value: c.value,
        currency: c.currency,
        unit: c.unit,
        confidence: c.confidence,
        context: c.context,
        current,
        status,
        quality,
        recommendation,
      };
    });
    candidateCount += candidates.length;

    items.push({
      recordId: gap.recordId,
      vertical: gap.vertical,
      destination: gap.destination,
      title: gap.title,
      sourceUrl: gap.sourceUrl,
      sourceTrust: { tier: trust.tier, score: trust.score, reasons: trust.reasons },
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
    totals: {
      gaps: gapReport.gaps.length,
      crawled: targets.length,
      candidates: candidateCount,
      unreachable,
      readyToApprove,
      needsReview,
      rejected,
      fromOfficialSource,
      fromUntrustedSource,
    },
    items,
    renderServiceConfigured: Boolean(process.env.RENDER_SERVICE_URL),
  };

  if (r2Configured) await putJson("seo/extraction-review.json", report);
  return report;
}
