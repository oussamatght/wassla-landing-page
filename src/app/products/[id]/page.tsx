import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dataSource, isNotFound } from "@/services/data-source";
import { toProductSummary } from "@/services/api/adapters";
import { formatPriceDA } from "@/lib/format";
import { CONDITION_LABELS, SECTOR_LABELS } from "@/lib/labels";
import { categoryLabel } from "@/lib/categories";
import { publicEnv } from "@/lib/env";
import { Gallery } from "@/components/marketplace/Gallery";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/ui/States";
import { JsonLd, Section } from "@/components/layout/PageHeader";
import { StoreBadges } from "@/components/app-showcase/StoreBadges";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const { data, error } = await dataSource.product(id);
  if (!data) {
    // Only a real 404 is "not found / noindex"; a transient API error must not de-index a live listing.
    return isNotFound(error)
      ? { title: "Annonce introuvable", robots: { index: false } }
      : { title: "Pièce détachée", description: "Annonce de pièce détachée sur WASSLA, la marketplace automobile en Algérie." };
  }
  return {
    title: data.title,
    description: `${data.title} — ${formatPriceDA(data.priceDA)}${data.wilaya ? `, ${data.wilaya}` : ""}. ${data.description.slice(0, 120)}`,
    alternates: { canonical: `/products/${data.id}` },
    openGraph: { title: data.title, images: data.images[0] ? [{ url: data.images[0] }] : undefined },
  };
}

function Spec({ label, value, mono = false }: { label: string; value?: string | number | null; mono?: boolean }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2.5 text-sm last:border-0">
      <dt className="text-text-secondary">{label}</dt>
      <dd className={`text-end font-medium ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}

export default async function ProductPage({ params }: Params) {
  const { id } = await params;
  const { data: product, error } = await dataSource.product(id);
  if (isNotFound(error)) notFound();
  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <ErrorState title="Cette annonce ne peut pas être affichée pour le moment" description="Le serveur WASSLA ne répond pas. Réessayez dans un instant." />
      </div>
    );
  }
  const { data: related } = await dataSource.relatedProducts(product.id);
  const moto = product.motoDetails;
  const heavy = product.heavyVehicleDetails;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          description: product.description.slice(0, 500),
          image: product.images.length ? product.images : undefined,
          sku: product.reference,
          mpn: product.manufacturerRef ?? product.oemReference,
          brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
          itemCondition: product.condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
          offers: {
            "@type": "Offer",
            priceCurrency: "DZD",
            price: product.priceDA,
            availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: `${publicEnv.siteUrl}/products/${product.id}`,
          },
        }}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="Fil d'Ariane" className="mb-6 text-xs text-text-muted">
          <ol className="flex flex-wrap gap-1.5">
            <li><Link href="/" className="hover:text-text-primary">Accueil</Link> /</li>
            <li><Link href="/catalogue" className="hover:text-text-primary">Catalogue</Link> /</li>
            <li aria-current="page" className="text-text-secondary">{product.title}</li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <Gallery images={product.images} title={product.title} />

          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={product.condition === "new" ? "accent" : "neutral"}>{CONDITION_LABELS[product.condition]}</Badge>
              <Badge>{SECTOR_LABELS[product.sector]}</Badge>
              {product.category && <Badge>{categoryLabel(product.category)}</Badge>}
            </div>
            <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">{product.title}</h1>
            <p className="tabular font-display text-4xl font-semibold">{formatPriceDA(product.priceDA)}</p>
            <p className={product.inStock ? "text-sm font-medium text-success" : "text-sm font-medium text-warning"}>
              {product.inStock ? "Disponible chez le vendeur" : "Rupture de stock"}
            </p>

            <div className="rounded-xl border border-border bg-surface-1 p-5">
              <h2 className="mb-1 text-base font-semibold">Commander cette pièce</h2>
              <p className="mb-4 text-sm text-text-secondary">
                La commande, le paiement et la livraison suivie se font dans l&apos;application WASSLA. Recherchez cette annonce par son titre ou sa référence.
              </p>
              <StoreBadges placement="product" />
            </div>

            {product.seller && (
              <div className="rounded-xl border border-border p-5">
                <h2 className="mb-3 font-mono text-xs tracking-[0.2em] text-text-muted uppercase">Vendeur</h2>
                <p className="font-semibold">{product.seller.name ?? "Vendeur WASSLA"}</p>
                {product.seller.wilaya && <p className="text-sm text-text-secondary">{product.seller.wilaya}</p>}
                {product.seller.rating && (
                  <p className="mt-1 text-sm text-text-secondary">
                    Note {product.seller.rating.average.toFixed(1)}/5 · {product.seller.rating.count} avis
                  </p>
                )}
              </div>
            )}

            <dl className="rounded-xl border border-border px-5 py-2">
              <Spec label="Référence constructeur" value={product.manufacturerRef} mono />
              <Spec label="Référence OEM" value={product.oemReference} mono />
              <Spec label="Marque" value={product.brand} />
              <Spec label="Désignation" value={product.partName} />
              <Spec label="Codes moteur" value={product.engineCodes.join(", ")} mono />
              <Spec label="Wilaya" value={product.wilaya} />
              {moto && <Spec label="Véhicule" value={[moto.vehicleKind, moto.brand, moto.model, moto.year].filter(Boolean).join(" · ")} />}
              {moto && <Spec label="Cylindrée" value={moto.displacementCc ? `${moto.displacementCc} cm³` : undefined} />}
              {heavy && <Spec label="Véhicule" value={[heavy.vehicleKind, heavy.brand, heavy.model, heavy.year].filter(Boolean).join(" · ")} />}
              {heavy && <Spec label="Motorisation" value={heavy.engine} />}
              {heavy && <Spec label="Puissance" value={heavy.powerHp ? `${heavy.powerHp} ch` : undefined} />}
              {heavy && <Spec label="Réf. constructeur véhicule" value={heavy.manufacturerReference} mono />}
            </dl>
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <section aria-labelledby="desc">
            <h2 id="desc" className="mb-3 text-xl font-semibold">Description du vendeur</h2>
            <p className="whitespace-pre-line text-text-secondary">{product.description}</p>
          </section>
          {product.compatibleVehicles.length > 0 && (
            <section aria-labelledby="compat">
              <h2 id="compat" className="mb-1 text-xl font-semibold">Compatibilité indiquée par le vendeur</h2>
              <p className="mb-3 text-xs text-text-muted">Vérifiez toujours la référence avec votre véhicule avant de commander.</p>
              <ul className="divide-y divide-border rounded-xl border border-border">
                {product.compatibleVehicles.map((v, i) => (
                  <li key={i} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                    <span>{[v.brand, v.model].filter(Boolean).join(" ")}</span>
                    <span className="font-mono text-text-secondary">
                      {[v.yearFrom && v.yearTo && v.yearFrom !== v.yearTo ? `${v.yearFrom}–${v.yearTo}` : v.yearFrom, v.engine].filter(Boolean).join(" · ")}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {related && related.length > 0 && (
        <Section id="similaires" title="Pièces similaires">
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {related.slice(0, 4).map((p) => (
              <li key={p.id}><ProductCard product={toProductSummary(p)} /></li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
