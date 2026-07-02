import { getJson, putJsonSafe, r2Configured } from "@/lib/r2";

// ─────────────────────────────────────────────────────────────────────────
// Change alerts — "email me when this destination's requirements change".
// The retention loop the niche actually wants: we already detect source drift
// (watch-sources cron); this turns that signal into return visits. Storage is
// plain R2 JSON per destination (no DB). Sending uses Resend's REST API when
// RESEND_API_KEY is set; otherwise notifications queue in an R2 outbox so
// nothing is lost before email is configured.
// ─────────────────────────────────────────────────────────────────────────

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://officialrequirements.com";
const FROM = process.env.EMAIL_FROM || "OfficialRequirements <alerts@officialrequirements.com>";
const MAX_PER_LIST = 5000;

export interface SubscriberList {
  destination: string;
  emails: { email: string; addedAt: string }[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email) && email.length <= 254;
}

const keyFor = (destination: string) => `subscriptions/${destination}.json`;

export async function addSubscriber(destination: string, email: string): Promise<{ ok: boolean; error?: string }> {
  const dest = destination.toLowerCase();
  if (!/^[a-z]{2}$/.test(dest)) return { ok: false, error: "Invalid destination" };
  if (!isValidEmail(email)) return { ok: false, error: "Invalid email" };
  if (!r2Configured) return { ok: false, error: "Storage not configured" };

  const list = (await getJson<SubscriberList>(keyFor(dest))) ?? { destination: dest, emails: [] };
  const normalized = email.trim().toLowerCase();
  if (list.emails.some((e) => e.email === normalized)) return { ok: true }; // idempotent
  if (list.emails.length >= MAX_PER_LIST) return { ok: false, error: "List full" };
  list.emails.push({ email: normalized, addedAt: new Date().toISOString() });
  await putJsonSafe(keyFor(dest), list);
  return { ok: true };
}

export async function removeSubscriber(destination: string, email: string): Promise<void> {
  const dest = destination.toLowerCase();
  const list = await getJson<SubscriberList>(keyFor(dest));
  if (!list) return;
  list.emails = list.emails.filter((e) => e.email !== email.trim().toLowerCase());
  await putJsonSafe(keyFor(dest), list);
}

/** Extract the destination code a changed record id refers to. */
export function destinationOfRecordId(id: string): string | null {
  // visa-{nat}-{dest}-student-visa | uni-{dest}-{program} | scholarship ids (skip)
  const visa = /^visa-[a-z]{2}-([a-z]{2})-/.exec(id);
  if (visa) return visa[1];
  const uni = /^uni-([a-z]{2})-/.exec(id);
  if (uni) return uni[1];
  return null;
}

interface OutboxItem {
  destination: string;
  recipients: number;
  subject: string;
  queuedAt: string;
  reason: string;
}

/** Generic transactional send (Resend REST, no SDK). BCC keeps recipient lists
 *  private from each other. Returns false when unconfigured or failed. */
export async function sendEmail(to: string[], subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || to.length === 0) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [FROM.replace(/^.*<|>$/g, "")], bcc: to, subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Called from the watch-sources cron: turn changed-source signals into alerts.
 *  Never throws — alerting must not break the freshness pipeline. */
export async function notifySourceChanges(
  changed: { url: string; affects: string[] }[],
  destName: (code: string) => string
): Promise<{ notified: number; queued: number }> {
  let notified = 0;
  let queued = 0;
  try {
    const byDest = new Map<string, string[]>(); // dest -> changed urls
    for (const c of changed) {
      for (const id of c.affects) {
        const dest = destinationOfRecordId(id);
        if (!dest) continue;
        const urls = byDest.get(dest) ?? [];
        if (!urls.includes(c.url)) urls.push(c.url);
        byDest.set(dest, urls);
      }
    }
    if (byDest.size === 0) return { notified, queued };

    const outbox = (await getJson<OutboxItem[]>("subscriptions/outbox.json")) ?? [];

    for (const [dest, urls] of byDest) {
      const list = await getJson<SubscriberList>(keyFor(dest));
      const recipients = list?.emails.map((e) => e.email) ?? [];
      if (recipients.length === 0) continue;

      const name = destName(dest);
      const subject = `${name}: an official study-abroad source changed`;
      const html = `
        <p>An official source behind the <strong>${name}</strong> requirements changed. We're re-verifying the figures.</p>
        <p>Changed source${urls.length > 1 ? "s" : ""}:</p>
        <ul>${urls.map((u) => `<li><a href="${u}">${u}</a></li>`).join("")}</ul>
        <p>Current, dated requirements: <a href="${SITE}/study/${dest}">${SITE}/study/${dest}</a></p>
        <p style="color:#64748b;font-size:12px">You get this because you subscribed to ${name} changes on OfficialRequirements.
        To unsubscribe, reply with "unsubscribe".</p>`;

      const sent = await sendEmail(recipients, subject, html);
      if (sent) {
        notified += recipients.length;
      } else {
        queued++;
        outbox.push({ destination: dest, recipients: recipients.length, subject, queuedAt: new Date().toISOString(), reason: process.env.RESEND_API_KEY ? "send failed" : "RESEND_API_KEY not set" });
      }
    }
    if (queued > 0) await putJsonSafe("subscriptions/outbox.json", outbox.slice(-200));
  } catch {
    /* non-fatal by design */
  }
  return { notified, queued };
}
