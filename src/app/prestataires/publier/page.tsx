import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Section } from "@/components/layout/PageHeader";
import { buttonClasses } from "@/components/ui/Button";
import { dataSource } from "@/services/data-source";

export const metadata: Metadata = {
  title: "Publier une annonce de prestation",
  description: "Prestataires automobiles : présentez vos services, photos et vidéos, et soyez contactés directement par téléphone ou WhatsApp.",
  alternates: { canonical: "/prestataires/publier" },
};

export default async function PublishListingPage() {
  const { data: trades } = await dataSource.trades();
  return (
    <>
      <PageHeader
        kicker="Prestataires"
        title="Publiez votre annonce de prestation"
        description="Lavage, diagnostic, vidange, mécanique mobile, dépannage… Présentez vos services et recevez des appels et messages WhatsApp de clients près de chez vous."
        crumbs={[{ href: "/", label: "Accueil" }, { href: "/prestataires", label: "Prestataires" }, { label: "Publier" }]}>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/espace-prestataire" className={buttonClasses("primary", "lg")}>Accéder à mon espace prestataire</Link>
          <Link href="/telecharger" className={buttonClasses("secondary", "lg")}>Créer un compte dans l&apos;application</Link>
        </div>
      </PageHeader>
      <Section kicker="Étapes" title="Comment publier ?">
        <ol className="grid gap-4 md:grid-cols-4">
          {[
            ["Compte prestataire", "Créez votre compte prestataire dans l'application WASSLA."],
            ["Abonnement actif", "Activez votre abonnement prestataire pour pouvoir publier."],
            ["Votre annonce", "Titre, métier, description, photos, vidéos courtes, zone, horaires et tarifs."],
            ["Validation", "L'équipe WASSLA vérifie l'annonce avant sa mise en ligne."],
          ].map(([t, d], i) => (
            <li key={t} className="rounded-xl border border-border p-5">
              <p className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-text-secondary">{d}</p>
            </li>
          ))}
        </ol>
        <ul className="mt-8 grid gap-3 text-sm text-text-secondary md:grid-cols-2">
          <li>• Jusqu&apos;à 8 photos (5 Mo chacune) et 2 vidéos de 60 secondes maximum.</li>
          <li>• Numéro de téléphone obligatoire, WhatsApp identique ou différent.</li>
          <li>• Plusieurs annonces possibles, une par métier ou offre.</li>
          <li>• Statistiques : vues de l&apos;annonce, clics sur Appeler et WhatsApp.</li>
        </ul>
      </Section>
      {trades && trades.length > 0 && (
        <Section kicker="Métiers" title="Les métiers présents sur WASSLA">
          <ul className="flex flex-wrap gap-2">
            {trades.map((t) => (
              <li key={t.key}>
                <Link href={`/prestataires?trade=${t.key}`} className="inline-flex min-h-10 items-center rounded-full border border-border px-4 text-sm hover:border-border-strong" title={t.examples}>
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
