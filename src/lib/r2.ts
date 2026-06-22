import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
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
    const name = (err as { name?: string })?.name;
    if (name === "NoSuchKey" || name === "NotFound") return null;
    throw err;
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

export async function listKeys(prefix: string): Promise<string[]> {
  if (!r2Configured) return [];
  const keys: string[] = [];
  let token: string | undefined;
  do {
    const res = await r2().send(
      new ListObjectsV2Command({ Bucket: R2_BUCKET, Prefix: prefix, ContinuationToken: token })
    );
    (res.Contents || []).forEach((o) => o.Key && keys.push(o.Key));
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);
  return keys;
}
