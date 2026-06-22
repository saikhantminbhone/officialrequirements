"use client";

import { useEffect, useRef } from "react";
import { useRuntimeConfig } from "./RuntimeConfigProvider";
import type { PageType } from "@/lib/config";

// Runtime-controlled ad slot.
//
// Golden rule (user requirement): NEVER show an empty ad placeholder. A slot
// only renders if (a) the admin enabled it for this page type AND (b) there is
// a real, configured ad network behind it. When AdSense has no inventory the
// <ins> self-collapses (data-ad-status="unfilled" → hidden via globals.css),
// and other networks fill a zero-height container so nothing shows until an ad
// actually loads. No dashed "Advertisement" boxes, ever.
declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdSlot({ id, pageType }: { id: string; pageType: PageType }) {
  const config = useRuntimeConfig();
  const insRef = useRef<HTMLModElement>(null);

  const slot = config.adSlots.find((s) => s.id === id);
  const enabled = Boolean(slot && slot.enabled && slot.pageTypes.includes(pageType) && slot.network !== "none");
  const isAdsense = enabled && slot!.network === "adsense";
  const hasAdsenseClient = Boolean(config.adsenseClientId);

  useEffect(() => {
    if (isAdsense && hasAdsenseClient && insRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        /* AdSense not loaded yet — ignore. */
      }
    }
  }, [isAdsense, hasAdsenseClient]);

  if (!enabled) return null;

  // AdSense: render a real unit only when a client id is configured. The unit
  // collapses to nothing when Google returns no ad.
  if (isAdsense) {
    if (!hasAdsenseClient) return null;
    return (
      <ins
        ref={insRef}
        className="adsbygoogle my-6 block no-print"
        style={{ display: "block" }}
        data-ad-client={config.adsenseClientId}
        data-ad-slot={id}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    );
  }

  // Other networks (Journey, Raptive, …) inject into their own containers via
  // their site-wide script. Give them a zero-height, unstyled mount point so the
  // page shows nothing until a real ad is actually placed.
  return <div className="no-print" data-ad-slot={id} data-ad-network={slot!.network} />;
}
