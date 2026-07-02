// Seed/re-seed: pushes the default runtime config to R2 (only if absent) and
// the scholarship seed records. Safe to re-run after expanding the seed data.
// Usage: node scripts/seed-r2.mjs   (reads R2_* from .env.local automatically)
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Plain Node doesn't load Next's env files — read .env.local / .env ourselves
// (values already in the environment win).
for (const file of [".env.local", ".env"]) {
  const p = join(__dirname, "..", file);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf-8").split("\n")) {
    const m = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (!m || line.trim().startsWith("#")) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!(m[1] in process.env)) process.env[m[1]] = v;
  }
}

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;
const R2_BUCKET = process.env.R2_BUCKET || process.env.R2_BUCKET_NAME || "officialreq";

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error("Missing R2 env vars. Set R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY.");
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

async function put(key, value) {
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: JSON.stringify(value, null, 2),
      ContentType: "application/json",
    })
  );
  console.log("✓ wrote", key);
}

// Minimal default runtime config (mirror of src/lib/config.ts defaults).
const runtime = {
  network: "adsense",
  adsenseClientId: "",
  adSlots: [
    { id: "in-content-1", enabled: true, network: "adsense", pageTypes: ["leaf", "hub"] },
    { id: "in-content-2", enabled: true, network: "adsense", pageTypes: ["leaf"] },
    { id: "sticky-rail", enabled: true, network: "adsense", pageTypes: ["leaf"] },
    { id: "mobile-anchor", enabled: true, network: "adsense", pageTypes: ["leaf", "hub"] },
  ],
  affiliates: [],
  leadGen: { enabled: true, headline: "Want an agency to handle your application?", description: "Get matched with a vetted study-abroad consultant.", ctaLabel: "Get matched →", formUrl: "https://example.com/leads" },
  updatedAt: new Date().toISOString(),
};

const scholarships = JSON.parse(readFileSync(join(__dirname, "../src/lib/req-data/seed/scholarships.json"), "utf-8"));

// Never clobber a runtime config the admin may have edited — write only if absent.
try {
  await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: "config/runtime.json" }));
  console.log("• config/runtime.json already exists — left untouched");
} catch {
  await put("config/runtime.json", runtime);
}

for (const s of scholarships) {
  await put(`data/scholarship/${s.id}.json`, s);
}
console.log(`Done. ${scholarships.length} scholarship records pushed.`);
