"use client";

import { browserApiUrl, publicEnv } from "@/lib/env";
import { track } from "@/features/analytics/track";
import { formatPhoneDisplay as displayPhone } from "@/lib/format";


/**
 * Call / WhatsApp buttons. A click only opens the phone or WhatsApp — it
 * never books anything. Clicks are counted server-side (no personal data).
 */
export function ContactButtons({ listingId, phone, whatsapp, title }: { listingId: string; phone: string; whatsapp: string; title: string }) {
  const message = encodeURIComponent(`Bonjour, je vous contacte via WASSLA au sujet de votre annonce « ${title} ». Êtes-vous disponible ?`);
  const record = (channel: "phone" | "whatsapp") => {
    track({ name: "provider_contact_click", listingId, channel });
    if (publicEnv.useFixtures) return;
    try {
      const body = new Blob([JSON.stringify({ channel })], { type: "application/json" });
      if (!navigator.sendBeacon?.(`${browserApiUrl()}/public/landing/providers/${listingId}/contact`, body)) {
        void fetch(`${browserApiUrl()}/public/landing/providers/${listingId}/contact`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ channel }), keepalive: true });
      }
    } catch {
      // Counting must never block contacting the provider.
    }
  };
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a href={`tel:${phone}`} onClick={() => record("phone")} className="bg-cta inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full px-6 text-base font-semibold text-white">
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6.6 3h3l1.5 4.5-2.2 1.4a11 11 0 0 0 6.2 6.2l1.4-2.2L21 14.4v3A2.6 2.6 0 0 1 18.4 20 15.4 15.4 0 0 1 4 5.6 2.6 2.6 0 0 1 6.6 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
        Appeler · <span className="tabular">{displayPhone(phone)}</span>
      </a>
      <a
        href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => record("whatsapp")}
        className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-success/60 px-6 text-base font-semibold text-text-primary hover:bg-success/10">
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M9 9.5c.3 1.8 2.7 4.2 4.5 4.5l1-1 1.5.7v1.3c-3.5.4-7.4-3.5-7-7h1.3l.7 1.5-1 1z" fill="currentColor" /></svg>
        Contacter sur WhatsApp
        <span className="sr-only">(nouvel onglet)</span>
      </a>
    </div>
  );
}
