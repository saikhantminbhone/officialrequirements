import { getJson, putJson } from "@/lib/r2";
import { defaultRuntimeConfig, RUNTIME_CONFIG_KEY, type RuntimeConfig } from "@/lib/config";

// Server-side loader/saver for the runtime config. Falls back to defaults when
// R2 has no config yet (fresh install).

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  const stored = await getJson<RuntimeConfig>(RUNTIME_CONFIG_KEY);
  return stored ?? defaultRuntimeConfig;
}

export async function saveRuntimeConfig(config: RuntimeConfig): Promise<void> {
  await putJson(RUNTIME_CONFIG_KEY, { ...config, updatedAt: new Date().toISOString() });
}
