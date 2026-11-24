import type { Metadata } from "next";
import { dataSource } from "@/services/data-source";
import { PageHeader } from "@/components/layout/PageHeader";
import { PrestataireSpace } from "./PrestataireSpace";

export const metadata: Metadata = {
  title: "Espace prestataire",
  description: "Publiez et gérez vos annonces de prestations automobiles sur WASSLA.",
  robots: { index: false, follow: false },
};

export default async function PrestataireSpacePage() {
  const { data: trades } = await dataSource.trades();
  return (
    <>
      <PageHeader
        kicker="Espace prestataire"
        title="Gérer mes annonces"
        description="Créez vos annonces, ajoutez photos et vidéos, suivez leur validation et les contacts reçus."
        crumbs={[{ href: "/", label: "Accueil" }, { href: "/prestataires", label: "Prestataires" }, { label: "Espace prestataire" }]}
      />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <PrestataireSpace trades={trades ?? []} />
      </div>
    </>
  );
}
