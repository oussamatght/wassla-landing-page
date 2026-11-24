import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Section } from "@/components/layout/PageHeader";
import { DownloadBand } from "@/components/app-showcase/DownloadBand";
import { buttonClasses } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Comment ça marche",
  description: "Acheteurs, vendeurs, livreurs et prestataires : découvrez comment fonctionne WASSLA.",
  alternates: { canonical: "/comment-ca-marche" },
};

const JOURNEYS = [
  {
    id: "acheteurs",
    kicker: "Acheteurs",
    title: "Trouvez la bonne pièce, faites-vous livrer",
    steps: [
      ["Recherchez", "Par nom, référence OEM, numéro VIN ou véhicule. Filtrez par catégorie, état, prix et wilaya."],
      ["Commandez", "Dans l'application, le coût de livraison est calculé avant que vous validiez."],
      ["Suivez", "Le vendeur prépare, un livreur récupère la pièce : suivez-le en direct jusqu'à vous."],
      ["Recevez", "La remise est confirmée par code ; un retour peut être demandé selon les conditions affichées."],
    ],
    cta: { href: "/catalogue", label: "Parcourir le catalogue" },
  },
  {
    id: "vendeurs",
    kicker: "Vendeurs",
    title: "Vendez vos pièces partout en Algérie",
    steps: [
      ["Créez votre compte vendeur", "Dans l'application, avec vos documents pour la vérification."],
      ["Publiez gratuitement", "Photos, prix, stock, références et compatibilités — automobile, moto ou poids lourds."],
      ["Préparez les commandes", "Acceptez, préparez, un livreur vient récupérer le colis."],
      ["Gagnez en visibilité", "Optionnel : le Boost place vos produits dans les emplacements sponsorisés."],
    ],
    cta: { href: "/vendre", label: "Devenir vendeur" },
  },
  {
    id: "prestataires",
    kicker: "Prestataires",
    title: "Faites connaître vos services",
    steps: [
      ["Créez votre compte prestataire", "Dans l'application, puis activez votre abonnement."],
      ["Publiez vos annonces", "Métier, description, photos et vidéos, zones et horaires d'intervention."],
      ["Validation", "Chaque annonce est vérifiée par l'équipe WASSLA avant publication."],
      ["Soyez contacté", "Les clients vous appellent ou vous écrivent sur WhatsApp directement."],
    ],
    cta: { href: "/prestataires/publier", label: "Publier une annonce" },
  },
  {
    id: "livreurs",
    kicker: "Livreurs",
    title: "Livrez avec WASSLA",
    steps: [
      ["Inscrivez-vous comme livreur", "Dans l'application, avec permis et documents du véhicule."],
      ["Acceptez des livraisons", "Les courses disponibles près de vous s'affichent en temps réel."],
      ["Récupérez et livrez", "Itinéraire guidé, confirmation par QR code et code à la remise."],
      ["Suivez vos gains", "Historique des livraisons et revenus dans votre espace."],
    ],
    cta: { href: "/telecharger", label: "Télécharger l'application" },
  },
] as const;

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        kicker="Comment ça marche"
        title="Une plateforme, quatre façons d'en profiter"
        description="WASSLA relie acheteurs, vendeurs, livreurs et prestataires de l'automobile en Algérie."
        crumbs={[{ href: "/", label: "Accueil" }, { label: "Comment ça marche" }]}>
        <nav aria-label="Profils" className="flex flex-wrap gap-2 pt-2">
          {JOURNEYS.map((j) => <a key={j.id} href={`#${j.id}`} className="rounded-full border border-border px-4 py-2 text-sm hover:border-border-strong">{j.kicker}</a>)}
        </nav>
      </PageHeader>
      {JOURNEYS.map((j) => (
        <Section key={j.id} id={j.id} kicker={j.kicker} title={j.title} action={<Link href={j.cta.href} className={buttonClasses("secondary")}>{j.cta.label}</Link>}>
          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {j.steps.map(([t, d], i) => (
              <li key={t} className="relative rounded-xl border border-border p-5">
                <p className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-text-secondary">{d}</p>
              </li>
            ))}
          </ol>
        </Section>
      ))}
      <DownloadBand placement="how-it-works" />
    </>
  );
}
