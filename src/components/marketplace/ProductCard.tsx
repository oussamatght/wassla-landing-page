import Image from "next/image";
import Link from "next/link";
import type { ProductSummary } from "@/types/domain";
import { formatPriceDA } from "@/lib/format";
import { CONDITION_LABELS, SECTOR_LABELS } from "@/lib/labels";
import { Badge, SponsoredBadge } from "@/components/ui/Badge";
import { BlueprintIllustration } from "@/components/ui/StaticStates";

interface ProductCardProps {
  product: ProductSummary;
  /** Above-the-fold cards may load eagerly; everything else is lazy. */
  priority?: boolean;
}

/**
 * The whole card is one link (single tab stop); the title is the accessible
 * name. "Sponsorisé" appears only when the backend reports an active boost.
 */
export function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface-1 shadow-(--shadow-card) transition-[transform,border-color] duration-(--duration-base) ease-(--ease-ui) hover:border-border-strong motion-safe:hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"
            className="object-cover transition-transform duration-(--duration-slow) group-hover:scale-[1.03]"
          />
        ) : (
          <div className="blueprint-grid flex h-full items-center justify-center">
            <BlueprintIllustration className="h-20 w-24 opacity-70" />
            <span className="sr-only">Pas de photo</span>
          </div>
        )}
        <div className="absolute start-2 top-2 flex flex-wrap gap-1.5">
          {product.sponsored && <SponsoredBadge />}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={product.condition === "new" ? "accent" : "neutral"}>{CONDITION_LABELS[product.condition]}</Badge>
          <span className="font-mono text-[11px] tracking-[0.12em] text-text-muted uppercase">{SECTOR_LABELS[product.sector]}</span>
        </div>

        <h3 className="line-clamp-2 text-[15px] leading-snug font-medium text-text-primary">
          <Link href={`/products/${product.id}`} className="after:absolute after:inset-0 focus-visible:outline-none after:focus-visible:rounded-lg after:focus-visible:outline-2 after:focus-visible:outline-focus">
            {product.title}
          </Link>
        </h3>

        {product.reference && (
          <p className="truncate font-mono text-xs text-text-muted" title={product.reference}>
            Réf. {product.reference}
          </p>
        )}

        <p className="tabular mt-auto pt-1 font-display text-lg font-semibold text-text-primary">{formatPriceDA(product.priceDA)}</p>

        <p className="flex min-w-0 items-center gap-1.5 text-xs text-text-secondary">
          {product.wilaya && (
            <>
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0">
                <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21z" stroke="currentColor" strokeWidth="1.75" />
                <circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.75" />
              </svg>
              <span className="truncate">{product.wilaya}</span>
            </>
          )}
          {product.sellerName && <span className="truncate before:me-1.5 before:content-['·']">{product.sellerName}</span>}
        </p>
        {!product.inStock && <p className="text-xs font-medium text-warning">Rupture de stock</p>}
      </div>
    </article>
  );
}
