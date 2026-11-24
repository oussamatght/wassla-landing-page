"use client";

import { useSyncExternalStore } from "react";
import { fr } from "@/i18n/fr";
import { STORE_LINKS, type StoreId } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { track } from "@/features/analytics/track";

/**
 * Official badge artwork (Google Play / App Store) is not in the repository
 * and must not be redrawn. Until the files are added (docs/DESIGN_SYSTEM.md
 * "Required assets"), the links render as clearly labelled WASSLA buttons.
 * The order puts the visitor's platform first on mobile.
 */
const STORES: Record<StoreId, { label: string; platform: string }> = {
  googlePlay: { label: fr.store.googlePlay, platform: "Android" },
  appStore: { label: fr.store.appStore, platform: "iPhone" },
};

function DownloadIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <rect x="6" y="2.75" width="12" height="18.5" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7.5v6.5m0 0l-2.6-2.6M12 14l2.6-2.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10.5 18h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const noopSubscribe = () => () => undefined;

function detectApple(): boolean {
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

export function StoreBadges({ placement, className }: { placement: string; className?: string }) {
  // Server render (and Android/desktop) lists Google Play first; Apple devices
  // get the App Store first after hydration.
  const isApple = useSyncExternalStore(noopSubscribe, detectApple, () => false);
  const order: StoreId[] = isApple ? ["appStore", "googlePlay"] : ["googlePlay", "appStore"];

  return (
    <ul className={cn("flex flex-wrap gap-3", className)}>
      {order.map((id) => (
        <li key={id}>
          <a
            href={STORE_LINKS[id]}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track({ name: "store_badge_click", store: id, placement })}
            className="inline-flex min-h-14 items-center gap-3 rounded-xl border border-border-strong bg-bg px-4 text-start transition-colors hover:border-accent/60 hover:bg-surface-2">
            <DownloadIcon />
            <span className="flex flex-col leading-tight">
              <span className="text-[11px] text-text-muted">{STORES[id].platform}</span>
              <span className="text-sm font-semibold text-text-primary">{STORES[id].label}</span>
            </span>
            <span className="sr-only">(nouvel onglet)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
