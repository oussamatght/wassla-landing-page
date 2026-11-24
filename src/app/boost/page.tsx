import type { Metadata } from "next";
import { dataSource } from "@/services/data-source";
import { PageHeader, Section } from "@/components/layout/PageHeader";
import { BoostOrderForm, BoostStatusLookup } from "@/components/boost/BoostOrderForm";
import { ErrorState } from "@/components/ui/States";
import { ApiErrorHint } from "@/components/ui/ApiErrorHint";
import { SponsoredBadge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Boost — plus de visibilité pour vos annonces",
  description: "Publier vos pièces reste gratuit. Avec Boost, vos produits apparaissent dans les emplacements sponsorisés de WASSLA.",
  alternates: { canonical: "/boost" },
};

export default async function BoostPage() {
  const { data, error } = await dataSource.boostPacks();
  return (
    <>
      <PageHeader
        kicker="Boost vendeurs"
        title="Donnez plus de visibilité à vos pièces"
        description="Publier vos annonces sur WASSLA reste gratuit. Boost place vos produits dans les emplacements « Sponsorisé » du site et de l'application."
        crumbs={[{ href: "/", label: "Accueil" }, { label: "Boost" }]}>
        <p className="max-w-2xl rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm text-text-primary">
          <strong>Important :</strong> le Boost améliore la visibilité de vos produits mais <strong>ne garantit ni ventes ni nombre d&apos;affichages</strong>. Les produits sponsorisés tournent équitablement entre vendeurs.
        </p>
      </PageHeader>

      <Section kicker="Fonctionnement" title="Comment fonctionne Boost ?">
        <ol className="grid gap-4 md:grid-cols-4">
          {[
            ["01", "Choisissez un pack", "Chaque pack contient des crédits. 1 crédit = 1 produit mis en avant pendant la durée du pack."],
            ["02", "Envoyez la demande", "Vous recevez une référence et payez hors ligne, puis envoyez le justificatif sur WhatsApp."],
            ["03", "Validation", "L'équipe WASSLA vérifie le paiement. Les crédits sont ajoutés uniquement à ce moment-là."],
            ["04", "Boostez vos produits", "Dans votre espace vendeur, utilisez un crédit sur l'un de vos produits actifs."],
          ].map(([n, t, d]) => (
            <li key={n} className="rounded-xl border border-border p-5">
              <p className="font-mono text-xs text-accent">{n}</p>
              <h3 className="mt-2 font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-text-secondary">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
          Les produits boostés portent toujours la mention <SponsoredBadge /> : les acheteurs savent qu&apos;il s&apos;agit d&apos;une mise en avant payante.
        </p>
      </Section>

      <Section id="commander" kicker="Packs" title="Demander un pack Boost">
        {error || !data ? <ErrorState title="Les packs Boost sont momentanément indisponibles" description="Réessayez dans un instant."><ApiErrorHint error={error} /></ErrorState> : <BoostOrderForm boost={data} />}
      </Section>

      <Section id="suivi" kicker="Suivi" title="Où en est ma demande ?">
        <BoostStatusLookup />
      </Section>
    </>
  );
}
