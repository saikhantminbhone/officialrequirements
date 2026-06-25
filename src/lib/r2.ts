import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// ─────────────────────────────────────────────────────────────────────────
// Cloudflare R2 is the data store (S3-compatible). No database.
//  - Requirement/scholarship records live as JSON objects under data/
//  - Runtime ad/affiliate config lives at config/runtime.json
//  - The admin panel writes here; pages read here at build time + runtime.
// ─────────────────────────────────────────────────────────────────────────

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

export const R2_BUCKET = process.env.R2_BUCKET || "officialreq";
export const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL || "";

/** True when R2 credentials are present. Lets the app run on seed-only data locally. */
export const r2Configured = Boolean(accountId && accessKeyId && secretAccessKey);

let _client: S3Client | null = null;

export function r2(): S3Client {
  if (!r2Configured) {
    throw new Error("R2 is not configured. Set R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY.");
  }
  if (!_client) {
    _client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
    });
  }
  return _client;
}

async function streamToString(body: unknown): Promise<string> {
  // Works for both Node streams and web streams returned by the SDK.
  const anyBody = body as { transformToString?: () => Promise<string> };
  if (anyBody?.transformToString) return anyBody.transformToString();
  const chunks: Buffer[] = [];
  // @ts-expect-error Node stream async iteration
  for await (const chunk of body) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf-8");
}

export async function getJson<T>(key: string): Promise<T | null> {
  if (!r2Configured) return null;
  try {
    const res = await r2().send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    const text = await streamToString(res.Body);
    return JSON.parse(text) as T;
  } catch (err: unknown) {
    // Missing object/bucket or any read error → treat as "no data" and fall back
    // to seed. Reads must never crash the static build (e.g. NoSuchBucket before
    // the bucket is created). Writes still surface errors to the admin.
    const name = (err as { name?: string })?.name;
    if (name && name !== "NoSuchKey" && name !== "NotFound") {
      console.warn(`[r2] getJson(${key}) failed (${name}); falling back to seed.`);
    }
    return null;
  }
}

export async function putJson(key: string, value: unknown): Promise<void> {
  await r2().send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: JSON.stringify(value, null, 2),
      ContentType: "application/json",
      CacheControl: "public, max-age=60",
    })
  );
}

/** Best-effort write for caches/reports — never throws (e.g. bucket missing).
 *  Returns true on success. Use for non-critical writes so jobs still complete
 *  read-only when R2 isn't fully set up yet. */
export async function putJsonSafe(key: string, value: unknown): Promise<boolean> {
  if (!r2Configured) return false;
  try {
    await putJson(key, value);
    return true;
  } catch (err: unknown) {
    console.warn(`[r2] putJsonSafe(${key}) failed (${(err as { name?: string })?.name}); skipped.`);
    return false;
  }
}

export async function deleteKey(key: string): Promise<void> {
  if (!r2Configured) return;
  await r2().send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}

export async function listKeys(prefix: string): Promise<string[]> {
  if (!r2Configured) return [];
  const keys: string[] = [];
  let token: string | undefined;
  try {
    do {
      const res = await r2().send(
        new ListObjectsV2Command({ Bucket: R2_BUCKET, Prefix: prefix, ContinuationToken: token })
      );
      (res.Contents || []).forEach((o) => o.Key && keys.push(o.Key));
      token = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (token);
  } catch (err: unknown) {
    // Missing bucket / transient error → no R2 records, fall back to seed.
    // Never let listing crash the static build.
    console.warn(`[r2] listKeys(${prefix}) failed (${(err as { name?: string })?.name}); using seed only.`);
    return [];
  }
  return keys;
}
