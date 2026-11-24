import Image from "next/image";
import Link from "next/link";
import type { ProviderListingSummary } from "@/types/domain";
import { INTERVENTION_LABELS, SECTOR_LABELS, pricingLabel } from "@/lib/labels";
import { SponsoredBadge } from "@/components/ui/Badge";
import { Chip } from "@/components/ui/Chip";
import { BlueprintIllustration } from "@/components/ui/StaticStates";

/**
 * Provider listing card (annonce prestataire). Deliberately shows no rating,
 * "vérifié" badge or availability: the backend does not store them for
 * listings. "Mis en avant" only during a paid promotion.
 */
export function ProviderCard({ listing }: { listing: ProviderListingSummary }) {
  const location = [listing.commune, listing.wilaya].filter(Boolean).join(", ");
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface-1 shadow-(--shadow-card) transition-[transform,border-color] duration-(--duration-base) hover:border-border-strong motion-safe:hover:-translate-y-1">
      <div className="relative aspect-[16/9] overflow-hidden bg-surface-2">
        {listing.coverImageUrl ? (
          <Image src={listing.coverImageUrl} alt="" fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw" className="object-cover" />
        ) : (
          <div className="blueprint-grid flex h-full items-center justify-center">
            <BlueprintIllustration className="h-16 w-20 opacity-60" />
          </div>
        )}
        {listing.promoted && (
          <div className="absolute start-2 top-2">
            <SponsoredBadge label="Mis en avant" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <p className="font-mono text-[11px] tracking-[0.14em] text-accent uppercase">{listing.tradeLabel}</p>
        <h3 className="text-base leading-snug font-semibold">
          <Link href={`/prestataires/${listing.id}`} className="after:absolute after:inset-0 focus-visible:outline-none after:focus-visible:rounded-lg after:focus-visible:outline-2 after:focus-visible:outline-focus">
            {listing.title}
          </Link>
        </h3>
        <p className="text-sm text-text-secondary">{listing.businessName}</p>
        {location && <p className="text-xs text-text-muted">{location}</p>}
        <div className="flex flex-wrap gap-1.5">
          {listing.vehicleTypes.map((type) => (
            <Chip key={type} className="min-h-7 px-2.5 text-xs">
              {SECTOR_LABELS[type]}
            </Chip>
          ))}
          {listing.interventionModes.slice(0, 2).map((mode) => (
            <Chip key={mode} className="min-h-7 px-2.5 text-xs">
              {INTERVENTION_LABELS[mode]}
            </Chip>
          ))}
        </div>
        <p className="tabular mt-auto pt-1 text-sm font-semibold text-text-primary">{pricingLabel(listing.pricing)}</p>
      </div>
    </article>
  );
}
