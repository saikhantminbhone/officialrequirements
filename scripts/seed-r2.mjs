// One-time seed: pushes the default runtime config to R2 so the admin has
// something to edit, and (optionally) the scholarship seed records.
// Usage: node scripts/seed-r2.mjs   (requires R2_* env vars)
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET = "officialreq" } = process.env;

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

await put("config/runtime.json", runtime);
for (const s of scholarships) {
  await put(`data/scholarship/${s.id}.json`, s);
}
console.log("Done.");
