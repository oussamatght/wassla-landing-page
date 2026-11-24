import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dataSource, isNotFound } from "@/services/data-source";
import { INTERVENTION_LABELS, SECTOR_LABELS, pricingLabel } from "@/lib/labels";
import { publicEnv } from "@/lib/env";
import { Gallery } from "@/components/marketplace/Gallery";
import { ContactButtons } from "@/components/providers/ContactButtons";
import { ReportListingForm } from "@/components/providers/ReportListingForm";
import { Chip } from "@/components/ui/Chip";
import { SponsoredBadge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/States";
import { JsonLd } from "@/components/layout/PageHeader";

type Params = { params: Promise<{ id: string }> };

const DAY_LABELS: Record<string, string> = { lun: "Lun", mar: "Mar", mer: "Mer", jeu: "Jeu", ven: "Ven", sam: "Sam", dim: "Dim" };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const { data, error } = await dataSource.provider(id);
  if (!data) {
    // Only a real 404 is "not found / noindex"; a transient API error must not de-index a live listing.
    return isNotFound(error)
      ? { title: "Annonce introuvable", robots: { index: false } }
      : { title: "Prestataire automobile", description: "Prestataire automobile en Algérie : contactez-le directement par téléphone ou WhatsApp sur WASSLA." };
  }
  return {
    title: `${data.title} — ${data.wilaya}`,
    description: `${data.tradeLabel} · ${data.businessName} · ${[data.commune, data.wilaya].filter(Boolean).join(", ")}. ${data.description.slice(0, 110)}`,
    alternates: { canonical: `/prestataires/${data.id}` },
  };
}

export default async function ProviderPage({ params }: Params) {
  const { id } = await params;
  const { data: l, error } = await dataSource.provider(id);
  if (isNotFound(error)) notFound();
  if (!l) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <ErrorState title="Cette annonce ne peut pas être affichée pour le moment" />
      </div>
    );
  }
  const location = [l.commune, l.wilaya].filter(Boolean).join(", ");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: l.businessName,
          description: l.description.slice(0, 500),
          telephone: l.phone,
          image: l.photos.map((p) => p.url),
          address: { "@type": "PostalAddress", addressLocality: l.commune ?? l.wilaya, addressRegion: l.wilaya, addressCountry: "DZ" },
          url: `${publicEnv.siteUrl}/prestataires/${l.id}`,
        }}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="Fil d'Ariane" className="mb-6 text-xs text-text-muted">
          <ol className="flex flex-wrap gap-1.5">
            <li><Link href="/" className="hover:text-text-primary">Accueil</Link> /</li>
            <li><Link href="/prestataires" className="hover:text-text-primary">Prestataires</Link> /</li>
            <li aria-current="page" className="text-text-secondary">{l.title}</li>
          </ol>
        </nav>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-6">
            <Gallery images={l.photos.map((p) => p.url)} title={l.title} />
            {l.videos.length > 0 && (
              <section aria-labelledby="videos" className="space-y-3">
                <h2 id="videos" className="text-lg font-semibold">Vidéos</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {l.videos.map((v, i) => (
                    <video key={v.id} controls preload="metadata" playsInline className="aspect-video w-full rounded-xl border border-border bg-surface-1" aria-label={`Vidéo ${i + 1} — ${l.title}`}>
                      <source src={v.url} />
                    </video>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-xs tracking-[0.18em] text-accent uppercase">{l.tradeLabel}</p>
              {l.promoted && <SponsoredBadge label="Mis en avant" />}
            </div>
            <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">{l.title}</h1>
            <p className="text-lg text-text-secondary">{l.businessName}</p>
            <p className="tabular text-xl font-semibold">{pricingLabel({ kind: l.pricing.kind, amountDA: l.pricing.amountDA ?? undefined })}</p>

            <ContactButtons listingId={l.id} phone={l.phone} whatsapp={l.whatsapp} title={l.title} />
            <p className="rounded-lg border border-border bg-surface-1/60 p-3 text-xs text-text-secondary">
              Le prestataire confirme lui-même sa disponibilité, son tarif et ses éventuels frais de déplacement. Aucune intervention n&apos;est réservée tant qu&apos;il ne l&apos;a pas acceptée.
            </p>

            <dl className="divide-y divide-border rounded-xl border border-border px-5">
              <div className="flex justify-between gap-4 py-3 text-sm"><dt className="text-text-secondary">Localisation</dt><dd className="text-end font-medium">{location}</dd></div>
              {l.coverageArea && <div className="flex justify-between gap-4 py-3 text-sm"><dt className="text-text-secondary">Zone couverte</dt><dd className="text-end font-medium">{l.coverageArea}</dd></div>}
              {l.travelFeeNote && <div className="flex justify-between gap-4 py-3 text-sm"><dt className="text-text-secondary">Déplacement</dt><dd className="text-end font-medium">{l.travelFeeNote}</dd></div>}
              {l.availability && (
                <div className="flex justify-between gap-4 py-3 text-sm">
                  <dt className="text-text-secondary">Disponibilités</dt>
                  <dd className="text-end font-medium">
                    {(l.availability.days ?? []).map((d) => DAY_LABELS[d] ?? d).join(", ")}
                    {l.availability.from && l.availability.to ? ` · ${l.availability.from}–${l.availability.to}` : ""}
                  </dd>
                </div>
              )}
            </dl>
            <div className="space-y-2">
              <h2 className="font-mono text-xs tracking-[0.2em] text-text-muted uppercase">Véhicules et interventions</h2>
              <div className="flex flex-wrap gap-2">
                {l.vehicleTypes.map((v) => <Chip key={v}>{SECTOR_LABELS[v]}</Chip>)}
                {l.interventionModes.map((m) => <Chip key={m}>{INTERVENTION_LABELS[m]}</Chip>)}
              </div>
            </div>
          </div>
        </div>

        <section aria-labelledby="desc" className="mt-12 max-w-3xl">
          <h2 id="desc" className="mb-3 text-xl font-semibold">Description</h2>
          <p className="whitespace-pre-line text-text-secondary">{l.description}</p>
        </section>
        <div className="mt-10 border-t border-border pt-6">
          <ReportListingForm listingId={l.id} />
        </div>
      </div>
    </>
  );
}
