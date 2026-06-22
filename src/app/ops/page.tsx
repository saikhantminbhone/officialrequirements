import { requireAdmin } from "@/lib/auth";
import { getAllRecordsForAdmin, daysSinceVerified } from "@/lib/req-data";
import { loadRuntimeConfig } from "@/lib/config-loader";
import { r2Configured } from "@/lib/r2";
import RebuildButton from "@/components/admin/RebuildButton";

export const dynamic = "force-dynamic";

const STALE_DAYS = 120;

export default async function AdminDashboard() {
  await requireAdmin();
  const [{ visa, university, scholarships }, config] = await Promise.all([
    getAllRecordsForAdmin(),
    loadRuntimeConfig(),
  ]);

  const totalRecords = visa.length + university.length + scholarships.length;
  const stale =
    visa.filter((r) => daysSinceVerified(r.lastVerified) > STALE_DAYS).length +
    university.filter((r) => daysSinceVerified(r.lastVerified) > STALE_DAYS).length +
    scholarships.filter((s) => daysSinceVerified(s.lastVerified) > STALE_DAYS).length;
  const enabledOffers = config.affiliates.filter((o) => o.enabled).length;
  const enabledSlots = config.adSlots.filter((s) => s.enabled).length;

  const cards = [
    { label: "Published records", value: totalRecords },
    { label: "Stale (> 120 days)", value: stale, warn: stale > 0 },
    { label: "Active affiliate offers", value: enabledOffers },
    { label: "Active ad slots", value: enabledSlots },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      {!r2Configured && (
        <div className="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          R2 is not configured — running on seed data only. Set R2 env vars to enable saving and
          auto-expansion from the data store.
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 p-4">
            <div className={`text-2xl font-bold ${c.warn ? "text-trust-amber" : "text-slate-900"}`}>{c.value}</div>
            <div className="mt-1 text-sm text-slate-500">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-800">Publish new pages / data changes</h2>
        <p className="mt-1 text-sm text-slate-500">
          Adding a nationality row or editing a record changes the static build. Trigger a rebuild to
          bake it. Ad/affiliate toggles take effect within ~60s without rebuilding.
        </p>
        <div className="mt-3">
          <RebuildButton />
        </div>
      </div>
    </div>
  );
}
