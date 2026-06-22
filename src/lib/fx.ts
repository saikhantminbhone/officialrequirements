import { getJson, putJson } from "@/lib/r2";

// ─────────────────────────────────────────────────────────────────────────
// FX / home-currency layer. Converting each destination's proof-of-funds into
// the applicant's home currency gives every nationality×destination page a
// genuinely unique, useful computed number — a strong anti-thin-content signal
// (the same role currency conversion plays on OfficialSalary). Deterministic;
// refreshed from the ECB (via frankfurter.app) by /api/cron/fx.
// ─────────────────────────────────────────────────────────────────────────

// Home currency per origin nationality (ISO-4217). Keep in sync with nationalities.json.
export const NATIONALITY_CURRENCY: Record<string, string> = {
  mm: "MMK", in: "INR", cn: "CNY", vn: "VND", pk: "PKR", ng: "NGN", ph: "PHP",
  bd: "BDT", np: "NPR", lk: "LKR", id: "IDR", th: "THB", ke: "KES", gh: "GHS",
  eg: "EGP", ma: "MAD", tr: "TRY", ir: "IRR", br: "BRL", mx: "MXN", co: "COP",
  ug: "UGX", et: "ETB", uz: "UZS",
  za: "ZAR", dz: "DZD", jo: "JOD", sa: "SAR", kz: "KZT", ar: "ARS", pe: "PEN", ua: "UAH",
};

// Units of currency per 1 EUR. Approximate static fallback (mid-2026); the cron
// overwrites these with live ECB rates. Marked approximate on-page.
export const FX_FALLBACK: { base: "EUR"; updatedAt: string; rates: Record<string, number> } = {
  base: "EUR",
  updatedAt: "2026-06-20",
  rates: {
    EUR: 1, GBP: 0.85, USD: 1.08, CAD: 1.47, AUD: 1.63, SEK: 11.3, NZD: 1.78, NOK: 11.5,
    CHF: 0.94, DKK: 7.46, JPY: 170, KRW: 1500, PLN: 4.3, CZK: 25, MYR: 5.1, AED: 3.97,
    MMK: 2270, INR: 90, CNY: 7.8, VND: 27500, PKR: 300, NGN: 1650, PHP: 61,
    BDT: 128, NPR: 144, LKR: 330, IDR: 17500, THB: 39, KES: 140, GHS: 16,
    EGP: 53, MAD: 10.8, TRY: 38, IRR: 64000, BRL: 5.9, MXN: 19.8, COP: 4400,
    UGX: 4100, ETB: 130, UZS: 13600,
    ZAR: 19.5, DZD: 145, JOD: 0.77, SAR: 4.05, KZT: 540, ARS: 1050, PEN: 4.05, UAH: 45,
  },
};

export interface FxRates {
  base: "EUR";
  updatedAt: string;
  rates: Record<string, number>;
}

export async function getFxRates(): Promise<FxRates> {
  const stored = await getJson<FxRates>("seo/fx-rates.json");
  if (stored?.rates) return { ...FX_FALLBACK, ...stored, rates: { ...FX_FALLBACK.rates, ...stored.rates } };
  return FX_FALLBACK;
}

/** Convert an amount from one currency to another using EUR-based rates. */
export function convert(amount: number, from: string, to: string, rates: FxRates["rates"]): number | null {
  const rFrom = rates[from];
  const rTo = rates[to];
  if (!rFrom || !rTo) return null;
  const inEur = amount / rFrom;
  return inEur * rTo;
}

/** Human-friendly rounded figure with thousands separators. */
export function formatMoney(amount: number, currency: string): string {
  const rounded = amount >= 1000 ? Math.round(amount / 100) * 100 : Math.round(amount);
  return `${rounded.toLocaleString("en-US")} ${currency}`;
}

// Cron: refresh rates from the ECB (frankfurter.app — free, no key).
export async function runFx(): Promise<{ ok: boolean; updatedAt: string; count: number; error?: string }> {
  const symbols = Object.keys(FX_FALLBACK.rates).filter((c) => c !== "EUR");
  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=EUR&to=${symbols.join(",")}`);
    if (!res.ok) throw new Error(`frankfurter ${res.status}`);
    const json = (await res.json()) as { date: string; rates: Record<string, number> };
    const rates: Record<string, number> = { EUR: 1, ...json.rates };
    const merged: FxRates = { base: "EUR", updatedAt: json.date, rates: { ...FX_FALLBACK.rates, ...rates } };
    await putJson("seo/fx-rates.json", merged);
    return { ok: true, updatedAt: json.date, count: Object.keys(json.rates).length };
  } catch (e) {
    // Many exotic currencies aren't on the ECB feed; static fallback covers them.
    return { ok: false, updatedAt: FX_FALLBACK.updatedAt, count: 0, error: e instanceof Error ? e.message : "fx failed" };
  }
}
