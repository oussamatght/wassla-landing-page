import { isFeatureEnabled } from "@/lib/flags";
import { browserApiUrl } from "@/lib/env";

export type AnalyticsEvent =
  | { name: "store_badge_click"; store: "googlePlay" | "appStore"; placement: string }
  | { name: "provider_contact_click"; listingId: string; channel: "phone" | "whatsapp" }
  | { name: "sponsored_impression"; productId: string; slot: number }
  | { name: "sponsored_click"; productId: string; slot: number }
  | { name: "ad_click"; bannerId: string; placement: string };

/**
 * First-party, privacy-conscious tracking. No cookies, no
 * third parties; respects Do Not Track. Until the backend collection endpoint
 * exists and the `analytics` flag is on,
 * this is a no-op (no fake numbers are ever produced).
 */
export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  if (!isFeatureEnabled("analytics")) return;
  if (navigator.doNotTrack === "1") return;
  try {
    const body = JSON.stringify({ ...event, path: window.location.pathname, at: Date.now() });
    navigator.sendBeacon?.(`${browserApiUrl()}/public/landing/events`, new Blob([body], { type: "application/json" }));
  } catch {
    // Tracking must never break the page.
  }
}
