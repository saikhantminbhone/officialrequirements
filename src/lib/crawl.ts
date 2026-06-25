import { detectGaps, type Gap } from "@/lib/gap-detector";
import { extractFromSource } from "@/lib/extract/source";
import { getVisaRecords, getUniversityRecords } from "@/lib/req-data";
import { getJson, putJson, putJsonSafe, r2Configured } from "@/lib/r2";
import { classifySource, type TrustTier } from "@/lib/source-trust";
import { acceptedSources } from "@/lib/sources";
import { checkQuality, recommend, autoApplyDecision, type QualityGrade, type Recommendation } from "@/lib/quality";
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
    autoApplied: number; // safe changes written without a human (when enabled)
  };
  items: ReviewItem[];
  autoApplied: { destination: string; field: string; value: number; currency: string | null; reason: string }[];
  autoApplyEnabled: boolean;
  renderServiceConfigured: boolean;
}

// Merge an auto-applied figure into the destination override in R2 as
// machine-compiled (honest provenance). Mirrors the factcheck override path.
async function writeAutoOverride(
  vertical: "visa" | "university",
  destination: string,
  field: string,
  value: number
): Promise<void> {
  const key = `data/overrides/${vertical}/${destination}.json`;
  const existing = (await getJson<Record<string, unknown>>(key)) ?? {};
  const toolDefaults = { ...((existing.toolDefaults as Record<string, unknown>) ?? {}), [field]: value };
  await putJson(key, {
    ...existing,
    toolDefaults,
    lastVerified: new Date().toISOString().slice(0, 10),
    verification: "machine-compiled",
    note: `Auto-updated ${field} to ${value} from the official source (machine-compiled; pending corroboration).`,
  });
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

  // Build the crawl target list: each gap's own source PLUS up to 2 quality-gated
  // registry sources for that destination (this is how AUTO-DISCOVERED sources
  // actually get crawled to fill gaps — closing the discovery→data loop).
  const registryByDest = new Map<string, string[]>();
  for (const s of await acceptedSources()) {
    if (s.category === "scholarship") continue; // visa/admission gaps
    const arr = registryByDest.get(s.country) ?? [];
    arr.push(s.url);
    registryByDest.set(s.country, arr);
  }
  const expanded: { gap: Gap; url: string }[] = [];
  for (const gap of gapReport.gaps) {
    const urls = new Set<string>();
    if (gap.sourceUrl) urls.add(gap.sourceUrl);
    (registryByDest.get(gap.destination) ?? []).slice(0, 2).forEach((u) => urls.add(u));
    for (const url of urls) expanded.push({ gap, url });
  }
  const targets = expanded.slice(0, limit);
  const items: ReviewItem[] = [];
  const autoAppliedLog: CrawlReport["autoApplied"] = [];
  // Opt-in: only self-update the live data when the operator enables it.
  const autoApplyEnabled = process.env.AUTO_APPLY_CRAWL === "1" && r2Configured;
  let unreachable = 0;
  let candidateCount = 0;
  let readyToApprove = 0;
  let needsReview = 0;
  let rejected = 0;
  let fromOfficialSource = 0;
  let fromUntrustedSource = 0;
  let autoApplied = 0;
  const autoApplyTasks: Promise<void>[] = [];

  for (const { gap, url } of targets) {
    const res = await extractFromSource(url);
    if (res.kind === "unreachable") unreachable++;
    const rec = byId.get(gap.recordId);

    // Auto trust-check the source URL we pulled these candidates from.
    const trust = classifySource(url);
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

      // Self-update the safe subset (gap fills + small corrections from official
      // sources), when enabled. Everything else stays in the human queue.
      if (autoApplyEnabled && (gap.vertical === "visa" || gap.vertical === "university")) {
        const decision = autoApplyDecision({ trustTier: trust.tier, quality, status, value: c.value, current });
        if (decision.apply) {
          autoApplyTasks.push(
            writeAutoOverride(gap.vertical, gap.destination, c.field, c.value).then(() => {
              autoApplied++;
              autoAppliedLog.push({ destination: gap.destination, field: c.field, value: c.value, currency: c.currency, reason: decision.reason });
            })
          );
        }
      }
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
      sourceUrl: url,
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

  // Flush any auto-apply writes before reporting.
  if (autoApplyTasks.length) await Promise.allSettled(autoApplyTasks);

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
      autoApplied,
    },
    items,
    autoApplied: autoAppliedLog,
    autoApplyEnabled,
    renderServiceConfigured: Boolean(process.env.RENDER_SERVICE_URL),
  };

  await putJsonSafe("seo/extraction-review.json", report);
  return report;
}
