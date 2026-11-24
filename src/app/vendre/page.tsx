import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Section } from "@/components/layout/PageHeader";
import { DownloadBand } from "@/components/app-showcase/DownloadBand";
import { buttonClasses } from "@/components/ui/Button";
import { dataSource } from "@/services/data-source";

export const metadata: Metadata = {
  title: "Vendre vos pièces sur WASSLA",
  description: "Publiez gratuitement vos pièces auto, moto et poids lourds et touchez des acheteurs partout en Algérie, avec la livraison intégrée.",
  alternates: { canonical: "/vendre" },
};

const BENEFITS = [
  ["Publication gratuite", "Aucun frais pour mettre vos pièces en ligne."],
  ["Toute l'Algérie", "Vos annonces sont visibles par les acheteurs des 58 wilayas."],
  ["Livraison intégrée", "Un livreur récupère le colis chez vous ; le prix est calculé automatiquement."],
  ["Recherche par VIN et OEM", "Renseignez références et compatibilités : les acheteurs vous trouvent par véhicule."],
  ["Trois univers", "Automobile, motos et poids lourds, avec des fiches adaptées à chaque type de véhicule."],
  ["Visibilité en option", "Le Boost place vos produits dans les emplacements sponsorisés."],
] as const;

export default async function SellPage() {
  const { data: stats } = await dataSource.stats();
  return (
    <>
      <PageHeader
        kicker="Vendeurs"
        title="Vendez vos pièces à toute l'Algérie"
        description="Créez votre boutique dans l'application WASSLA, publiez gratuitement et laissez la livraison à nos livreurs."
        crumbs={[{ href: "/", label: "Accueil" }, { label: "Vendre" }]}>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/telecharger" className={buttonClasses("primary", "lg")}>Créer mon compte vendeur</Link>
          <Link href="/boost" className={buttonClasses("secondary", "lg")}>Découvrir Boost</Link>
        </div>
        {stats && stats.sellers > 0 && (
          <p className="text-sm text-text-secondary">
            Déjà <strong className="tabular text-text-primary">{stats.sellers.toLocaleString("fr-FR")}</strong> vendeurs actifs et <strong className="tabular text-text-primary">{stats.products.toLocaleString("fr-FR")}</strong> annonces en ligne.
          </p>
        )}
      </PageHeader>
      <Section kicker="Avantages" title="Pourquoi vendre sur WASSLA ?">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(([t, d]) => (
            <li key={t} className="rounded-xl border border-border bg-surface-1/60 p-5">
              <h3 className="font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-text-secondary">{d}</p>
            </li>
          ))}
        </ul>
      </Section>
      <Section kicker="Démarrer" title="Votre boutique en quatre étapes">
        <ol className="grid gap-4 md:grid-cols-4">
          {[
            ["Téléchargez l'application", "Choisissez le profil « Vendeur » à l'inscription."],
            ["Faites vérifier votre compte", "Envoyez vos documents (registre de commerce, pièce d'identité)."],
            ["Indiquez votre adresse de retrait", "Elle sert au calcul de la livraison."],
            ["Publiez vos pièces", "Photos, prix, stock, références et compatibilités."],
          ].map(([t, d], i) => (
            <li key={t} className="rounded-xl border border-border p-5">
              <p className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-text-secondary">{d}</p>
            </li>
          ))}
        </ol>
      </Section>
      <DownloadBand placement="sell" title="Ouvrez votre boutique WASSLA" />
    </>
  );
}
