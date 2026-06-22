"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { defaultRuntimeConfig, type RuntimeConfig } from "@/lib/config";

// Fetches runtime ad/affiliate config from /api/config once on mount, so the
// whole tree can toggle ad slots and swap affiliate offers without a rebuild.
const Ctx = createContext<RuntimeConfig>(defaultRuntimeConfig);

export function useRuntimeConfig(): RuntimeConfig {
  return useContext(Ctx);
}

export function RuntimeConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<RuntimeConfig>(defaultRuntimeConfig);

  useEffect(() => {
    let alive = true;
    fetch("/api/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (alive && json) setConfig(json as RuntimeConfig);
      })
      .catch(() => void 0);
    return () => {
      alive = false;
    };
  }, []);

  // Load the AdSense library exactly once, and only when a real client id is
  // configured — so a site with no ads ships no ad script at all.
  useEffect(() => {
    const client = config.adsenseClientId;
    if (!client) return;
    if (document.querySelector('script[data-adsense="1"]')) return;
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    s.crossOrigin = "anonymous";
    s.dataset.adsense = "1";
    document.head.appendChild(s);
  }, [config.adsenseClientId]);

  return <Ctx.Provider value={config}>{children}</Ctx.Provider>;
}
