import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/layout/PageHeader";
import { Faq } from "@/components/ui/Faq";
import { FAQ } from "@/features/editorial/content";
import { DownloadBand } from "@/components/app-showcase/DownloadBand";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description: "Commande, livraison, compatibilité, retours, vente et prestataires : les réponses aux questions les plus posées sur WASSLA.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <PageHeader kicker="Aide" title="Questions fréquentes" crumbs={[{ href: "/", label: "Accueil" }, { label: "FAQ" }]} />
      <Section>
        <div className="max-w-3xl">
          <Faq items={FAQ} withSchema />
        </div>
      </Section>
      <DownloadBand placement="faq" compact />
    </>
  );
}
