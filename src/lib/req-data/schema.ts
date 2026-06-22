import { z } from "zod";

// Zod mirrors of the TS types — used to validate records at build time and
// whenever the admin saves data to R2 (human-verify-before-publish for YMYL).

const sourceSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  type: z.enum(["government", "university", "official-body"]),
});

const requirementItemSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  detail: z.string().min(1),
  required: z.boolean(),
  amount: z
    .object({
      value: z.number(),
      currency: z.string(),
      per: z.enum(["year", "month", "once"]).optional(),
    })
    .optional(),
  appliesIf: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  affiliateTag: z
    .enum([
      "english-test",
      "money-transfer",
      "insurance",
      "esim",
      "blocked-account",
      "accommodation",
      "agency-lead",
      "flights",
    ])
    .optional(),
});

const changeLogSchema = z.object({ date: z.string(), note: z.string() });

export const requirementRecordSchema = z.object({
  id: z.string().min(1),
  vertical: z.enum(["visa", "university", "scholarship"]),
  nationality: z.string().optional(),
  destination: z.string().min(2),
  category: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  requirements: z.array(requirementItemSchema).min(1),
  toolDefaults: z
    .object({
      blockedAccountAmount: z.number().optional(),
      blockedAccountCurrency: z.string().optional(),
      livingCostPerMonth: z.number().optional(),
      visaFee: z.number().optional(),
      insurancePerMonth: z.number().optional(),
      processingWeeks: z.number().optional(),
      intakeMonths: z.array(z.number().min(1).max(12)).optional(),
    })
    .optional(),
  source: sourceSchema,
  extraSources: z.array(sourceSchema).optional(),
  lastVerified: z.string(),
  verifiedBy: z.string().min(1),
  verification: z.enum(["human-verified", "auto-corroborated", "machine-compiled"]).optional(),
  status: z.enum(["published", "draft", "unpublished-stale"]),
  changeLog: z.array(changeLogSchema),
});

const eligibilityRuleSchema = z.object({
  key: z.string(),
  question: z.string(),
  field: z.string(),
  op: z.enum(["eq", "gte", "lte", "in", "neq", "truthy"]),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.union([z.string(), z.number()]))]).optional(),
  failMessage: z.string(),
  soft: z.boolean().optional(),
});

export const scholarshipRecordSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  provider: z.string(),
  destination: z.string(),
  summary: z.string(),
  eligibility: z.array(eligibilityRuleSchema),
  benefits: z.array(z.string()),
  deadlines: z.array(z.object({ intake: z.string(), date: z.string() })),
  source: sourceSchema,
  lastVerified: z.string(),
  verifiedBy: z.string(),
  verification: z.enum(["human-verified", "auto-corroborated", "machine-compiled"]).optional(),
  status: z.enum(["published", "draft", "unpublished-stale"]),
  changeLog: z.array(changeLogSchema),
});

export type RequirementRecordInput = z.infer<typeof requirementRecordSchema>;
export type ScholarshipRecordInput = z.infer<typeof scholarshipRecordSchema>;
