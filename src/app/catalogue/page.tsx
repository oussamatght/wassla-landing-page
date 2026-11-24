import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { CatalogueView } from "@/components/marketplace/CatalogueView";
import { DownloadBand } from "@/components/app-showcase/DownloadBand";
import { parseCatalogueParams, type SearchParams } from "@/features/catalogue/params";

export const metadata: Metadata = {
  title: "Catalogue de pièces auto, moto et poids lourds",
  description: "Recherchez des pièces par nom, référence constructeur ou VIN, et filtrez par catégorie, état, prix et wilaya.",
  alternates: { canonical: "/catalogue" },
};

export default async function CataloguePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = parseCatalogueParams(await searchParams);
  return (
    <>
      <PageHeader
        kicker="Catalogue"
        title="Toutes les pièces"
        description="Annonces publiées par des vendeurs partout en Algérie. Commandez et faites-vous livrer via l'application WASSLA."
        crumbs={[{ href: "/", label: "Accueil" }, { label: "Catalogue" }]}
      />
      <CatalogueView basePath="/catalogue" query={query} />
      <DownloadBand placement="catalogue" compact />
    </>
  );
}
