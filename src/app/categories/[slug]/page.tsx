import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { CatalogueView } from "@/components/marketplace/CatalogueView";
import { DownloadBand } from "@/components/app-showcase/DownloadBand";
import { parseCatalogueParams, type SearchParams } from "@/features/catalogue/params";
import { SECTOR_SLUGS, type SectorSlug } from "@/lib/labels";

const COPY: Record<SectorSlug, { title: string; kicker: string; description: string }> = {
  automobile: {
    kicker: "01 · Automobile",
    title: "Pièces automobile",
    description: "Moteur, freinage, suspension, carrosserie, électricité… Recherchez par nom, référence OEM ou numéro VIN.",
  },
  motos: {
    kicker: "02 · Motos",
    title: "Pièces moto, scooter et quad",
    description: "Transmission, freinage et entretien pour les deux-roues et les quads.",
  },
  "poids-lourds": {
    kicker: "03 · Poids lourds",
    title: "Pièces poids lourds",
    description: "Camions et tracteurs routiers, bus et autocars, remorques et semi-remorques.",
  },
};

export function generateStaticParams() {
  return Object.keys(SECTOR_SLUGS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const copy = COPY[slug as SectorSlug];
  if (!copy) return {};
  return { title: copy.title, description: copy.description, alternates: { canonical: `/categories/${slug}` } };
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<SearchParams> }) {
  const { slug } = await params;
  const sector = SECTOR_SLUGS[slug as SectorSlug];
  if (!sector) notFound();
  const copy = COPY[slug as SectorSlug];
  const query = parseCatalogueParams(await searchParams, sector);
  return (
    <>
      <PageHeader
        kicker={copy.kicker}
        title={copy.title}
        description={copy.description}
        crumbs={[{ href: "/", label: "Accueil" }, { href: "/catalogue", label: "Catalogue" }, { label: copy.title }]}
      />
      <CatalogueView basePath={`/categories/${slug}`} query={query} fixedSector={sector} />
      <DownloadBand placement={`category-${slug}`} compact />
    </>
  );
}
