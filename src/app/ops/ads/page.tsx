import { requireAdmin } from "@/lib/auth";
import { loadRuntimeConfig } from "@/lib/config-loader";
import AdsManager from "@/components/admin/AdsManager";

export const dynamic = "force-dynamic";

export default async function AdminAdsPage() {
  await requireAdmin();
  const config = await loadRuntimeConfig();
  return <AdsManager initial={config} />;
}
