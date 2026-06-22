"use client";

import { useState } from "react";
import type { RuntimeConfig, AdNetwork } from "@/lib/config";

// Runtime ad + affiliate manager. Edits the config and POSTs to /api/admin/save,
// which writes config/runtime.json to R2. Changes go live within ~60s — no
// rebuild. This is the OfficialSalary runtime-config trick.
export default function AdsManager({ initial }: { initial: RuntimeConfig }) {
  const [config, setConfig] = useState<RuntimeConfig>(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function update(patch: Partial<RuntimeConfig>) {
    setConfig((c) => ({ ...c, ...patch }));
  }

  async function save() {
    setState("saving");
    const res = await fetch("/api/admin/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "config", config }),
    });
    setState(res.ok ? "saved" : "error");
  }

  function moveOffer(id: string, dir: -1 | 1) {
    setConfig((c) => {
      const offers = [...c.affiliates];
      const i = offers.findIndex((o) => o.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= offers.length) return c;
      [offers[i].order, offers[j].order] = [offers[j].order, offers[i].order];
      return { ...c, affiliates: offers };
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Ads &amp; affiliate</h1>
        <div className="flex items-center gap-3">
          {state === "saved" && <span className="text-sm text-trust-green">Saved — live in ~60s.</span>}
          {state === "error" && <span className="text-sm text-red-600">Save failed.</span>}
          <button
            onClick={save}
            disabled={state === "saving"}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {state === "saving" ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      <section className="mt-6">
        <h2 className="font-semibold text-slate-800">Ad network</h2>
        <select
          value={config.network}
          onChange={(e) => update({ network: e.target.value as AdNetwork })}
          className="mt-2 rounded border border-slate-300 px-2 py-1 text-sm"
        >
          <option value="adsense">AdSense</option>
          <option value="journey">Journey by Mediavine</option>
          <option value="raptive">Raptive</option>
          <option value="none">None (off)</option>
        </select>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-slate-800">Ad slots</h2>
        <div className="mt-2 space-y-2">
          {config.adSlots.map((slot) => (
            <label key={slot.id} className="flex items-center justify-between rounded border border-slate-100 px-3 py-2 text-sm">
              <span>
                <span className="font-medium text-slate-700">{slot.id}</span>
                <span className="ml-2 text-slate-400">{slot.pageTypes.join(", ")}</span>
              </span>
              <input
                type="checkbox"
                checked={slot.enabled}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    adSlots: c.adSlots.map((s) => (s.id === slot.id ? { ...s, enabled: e.target.checked } : s)),
                  }))
                }
              />
            </label>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-slate-800">Affiliate offers</h2>
        <p className="text-sm text-slate-500">Reorder by EPC. Toggle to enable/disable. Edits go live without a rebuild.</p>
        <div className="mt-2 space-y-2">
          {[...config.affiliates]
            .sort((a, b) => a.order - b.order)
            .map((o) => (
              <div key={o.id} className="rounded border border-slate-100 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-brand-700">{o.tag}</span>
                    <span className="ml-2 font-medium text-slate-800">{o.brand}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <button onClick={() => moveOffer(o.id, -1)} className="rounded border px-2">↑</button>
                    <button onClick={() => moveOffer(o.id, 1)} className="rounded border px-2">↓</button>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={o.enabled}
                        onChange={(e) =>
                          setConfig((c) => ({
                            ...c,
                            affiliates: c.affiliates.map((x) => (x.id === o.id ? { ...x, enabled: e.target.checked } : x)),
                          }))
                        }
                      />
                      on
                    </label>
                  </div>
                </div>
                <input
                  value={o.url}
                  onChange={(e) =>
                    setConfig((c) => ({
                      ...c,
                      affiliates: c.affiliates.map((x) => (x.id === o.id ? { ...x, url: e.target.value } : x)),
                    }))
                  }
                  className="mt-2 w-full rounded border border-slate-200 px-2 py-1 text-xs text-slate-600"
                  placeholder="Affiliate URL"
                />
              </div>
            ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold text-slate-800">Lead-gen</h2>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={config.leadGen.enabled}
            onChange={(e) => update({ leadGen: { ...config.leadGen, enabled: e.target.checked } })}
          />
          Enable lead-gen block
        </label>
        <input
          value={config.leadGen.formUrl}
          onChange={(e) => update({ leadGen: { ...config.leadGen, formUrl: e.target.value } })}
          className="mt-2 w-full max-w-md rounded border border-slate-200 px-2 py-1 text-sm"
          placeholder="Lead form URL"
        />
      </section>
    </div>
  );
}
