// Self-test for the extraction engine, runnable with plain Node (no build):
//   node scripts/extract-selftest.mjs
// It mirrors the core logic of src/lib/extract/{figures,html}.ts against
// fixtures for the three page types — static HTML, JSON API, and a JS/SPA page
// whose data is embedded as JSON — to prove deterministic extraction works.

const CURRENCY_CODES = ["EUR","GBP","USD","CAD","AUD","NZD","SEK","NOK","DKK","CHF","PLN","CZK","JPY","KRW","MYR","AED"];
const SYMBOL_TO_CODE = { "€":"EUR","£":"GBP","$":"USD","¥":"JPY","₩":"KRW" };
const NUM = String.raw`(?:\d{1,3}(?:[.,\s ]\d{3})+|\d+)(?:[.,]\d{1,2})?`;

function parseAmount(raw) {
  let s = raw.replace(/[\s ]/g, "");
  const lastSep = Math.max(s.lastIndexOf(","), s.lastIndexOf("."));
  if (lastSep !== -1) {
    const tail = s.slice(lastSep + 1);
    if (tail.length === 2 && /^\d{2}$/.test(tail)) s = s.slice(0, lastSep).replace(/[.,]/g, "") + "." + tail;
    else s = s.replace(/[.,]/g, "");
  }
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}
function unitNear(t) {
  t = t.toLowerCase();
  if (/month|monthly/.test(t)) return "month";
  if (/year|annum|annual|yearly/.test(t)) return "year";
  return "unknown";
}
function findMoney(text) {
  const hits = []; const seen = new Set();
  const reSym = new RegExp(String.raw`([€£$¥₩])\s?(${NUM})`, "g");
  const reCodeSuf = new RegExp(String.raw`(${NUM})\s?(${CURRENCY_CODES.join("|")})\b`, "gi");
  const reCodePre = new RegExp(String.raw`(${CURRENCY_CODES.join("|")})\s?(${NUM})`, "gi");
  const reLooseSuf = new RegExp(String.raw`(${NUM})[^\d€£$¥₩]{1,18}?\b(${CURRENCY_CODES.join("|")})\b`, "gi");
  const reLoosePre = new RegExp(String.raw`\b(${CURRENCY_CODES.join("|")})\b[^\d€£$¥₩]{1,18}?(${NUM})`, "gi");
  const push = (amount, currency, idx) => {
    if (amount == null) return;
    const key = `${amount}|${currency}`; if (seen.has(key)) return; seen.add(key);
    const ctx = text.slice(Math.max(0, idx - 70), idx + 70).replace(/\s+/g, " ").trim();
    hits.push({ amount, currency, unit: unitNear(ctx), context: ctx, index: idx });
  };
  let m;
  while ((m = reSym.exec(text))) push(parseAmount(m[2]), SYMBOL_TO_CODE[m[1]] ?? null, m.index);
  while ((m = reCodeSuf.exec(text))) push(parseAmount(m[1]), m[2].toUpperCase(), m.index);
  while ((m = reCodePre.exec(text))) push(parseAmount(m[2]), m[1].toUpperCase(), m.index);
  while ((m = reLooseSuf.exec(text))) push(parseAmount(m[1]), m[2].toUpperCase(), m.index);
  while ((m = reLoosePre.exec(text))) push(parseAmount(m[2]), m[1].toUpperCase(), m.index);
  return hits.sort((a,b)=>a.index-b.index);
}
const FUNDS_KW = ["proof of funds","means of subsistence","maintenance","financial means","blocked account","financial resources","income requirement","funds requirement","financial capacity","living costs","subsistence"];
function candidatesFromText(text) {
  const out = [];
  const lower = text.toLowerCase();
  for (const hit of findMoney(text)) {
    const w = lower.slice(Math.max(0, hit.index - 120), hit.index + 120);
    if (FUNDS_KW.some((k) => w.includes(k))) {
      out.push({ field: "blockedAccountAmount", value: hit.unit === "month" ? Math.round(hit.amount * 12) : hit.amount, currency: hit.currency, unit: hit.unit });
    }
  }
  // de-dup keep first
  const seen = new Set(); const res = [];
  for (const c of out) { if (!seen.has(c.field)) { seen.add(c.field); res.push(c); } }
  return res;
}
function htmlToText(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
}
function extractEmbeddedJson(html) {
  const blobs = [];
  const next = /<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i.exec(html);
  if (next) { try { blobs.push(JSON.parse(next[1])); } catch {} }
  const re = /<script[^>]*type=["']application\/(?:ld\+)?json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m; while ((m = re.exec(html))) { try { blobs.push(JSON.parse(m[1].trim())); } catch {} }
  return blobs;
}
function jsonToText(v, d = 0) {
  if (d > 8 || v == null) return "";
  if (typeof v === "string") return v + " ";
  if (typeof v === "number" || typeof v === "boolean") return v + " ";
  if (Array.isArray(v)) return v.map((x) => jsonToText(x, d + 1)).join(" ");
  if (typeof v === "object") return Object.entries(v).map(([k, val]) => `${k}: ${jsonToText(val, d + 1)}`).join(" ");
  return "";
}

let pass = 0, fail = 0;
function check(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`${ok ? "✓" : "✗"} ${name} -> ${JSON.stringify(got)}`);
  ok ? pass++ : fail++;
}

// 1) Static HTML (Germany style)
const html1 = `<html><body><h1>Student visa</h1><p>You must show proof of funds of <strong>€11,904</strong> per year in a blocked account.</p></body></html>`;
check("static HTML €/year", candidatesFromText(htmlToText(html1))[0], { field: "blockedAccountAmount", value: 11904, currency: "EUR", unit: "year" });

// 2) JSON API (Canada style)
const apiJson = { studyPermit: { proofOfFunds: { amount: 22895, currency: "CAD", note: "living costs" } } };
check("JSON API CAD", candidatesFromText(jsonToText(apiJson))[0], { field: "blockedAccountAmount", value: 22895, currency: "CAD", unit: "unknown" });

// 3) JS/SPA page — data embedded as Next.js __NEXT_DATA__, no visible text
const spaHtml = `<div id="__next"></div><script id="__NEXT_DATA__" type="application/json">${JSON.stringify({ props: { pageProps: { rule: "maintenance financial means of 1,062 EUR per month for non-EU students" } } })}</script>`;
const spaText = htmlToText(spaHtml) + " " + extractEmbeddedJson(spaHtml).map((b) => jsonToText(b)).join(" ");
check("SPA embedded €/month→year", candidatesFromText(spaText)[0], { field: "blockedAccountAmount", value: 12744, currency: "EUR", unit: "month" });

// 4) Monthly Sweden SEK example
check("SEK/month→year", candidatesFromText("maintenance requirement of 10,656 SEK per month")[0], { field: "blockedAccountAmount", value: 127872, currency: "SEK", unit: "month" });

// 5) EU-decimal Italy example
check("EU decimal €10.179,85/year", candidatesFromText("proof of financial means: 10.179,85 EUR for the academic year")[0], { field: "blockedAccountAmount", value: 10179.85, currency: "EUR", unit: "year" });

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
