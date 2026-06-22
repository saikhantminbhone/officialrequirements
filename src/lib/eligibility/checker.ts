import type { EligibilityRule, ScholarshipRecord } from "@/lib/req-data/types";

// Pure, deterministic rules engine — no I/O, fully unit-testable, and runs
// identically on server (for SSR text) and client (for interactivity).

export type Answers = Record<string, string | number | boolean>;

export interface RuleResult {
  rule: EligibilityRule;
  passed: boolean;
  soft: boolean;
}

export interface EligibilityResult {
  eligible: boolean; // all hard rules pass
  hasWarnings: boolean; // any soft rule fails
  results: RuleResult[];
  failedHard: RuleResult[];
  warnings: RuleResult[];
}

function evalRule(rule: EligibilityRule, answers: Answers): boolean {
  const actual = answers[rule.field];
  const expected = rule.value;
  switch (rule.op) {
    case "truthy":
      return Boolean(actual);
    case "eq":
      return actual === expected;
    case "neq":
      return actual !== expected;
    case "gte":
      return typeof actual === "number" && typeof expected === "number" && actual >= expected;
    case "lte":
      return typeof actual === "number" && typeof expected === "number" && actual <= expected;
    case "in":
      return Array.isArray(expected) && (expected as (string | number)[]).includes(actual as string | number);
    default:
      return false;
  }
}

export function checkEligibility(rules: EligibilityRule[], answers: Answers): EligibilityResult {
  const results: RuleResult[] = rules.map((rule) => ({
    rule,
    passed: evalRule(rule, answers),
    soft: Boolean(rule.soft),
  }));
  const failedHard = results.filter((r) => !r.passed && !r.soft);
  const warnings = results.filter((r) => !r.passed && r.soft);
  return {
    eligible: failedHard.length === 0,
    hasWarnings: warnings.length > 0,
    results,
    failedHard,
    warnings,
  };
}

export function checkScholarship(record: ScholarshipRecord, answers: Answers): EligibilityResult {
  return checkEligibility(record.eligibility, answers);
}
