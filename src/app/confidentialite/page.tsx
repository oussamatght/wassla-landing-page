import type { Metadata } from "next";
import { LegalPlaceholder } from "@/components/layout/LegalPlaceholder";

export const metadata: Metadata = { title: "Politique de confidentialité", robots: { index: false } };

export default function Page() {
  return <LegalPlaceholder title="Politique de confidentialité" sections={["Données collectées (compte, commandes, localisation pendant la livraison)", "Finalités et bases légales", "Durées de conservation", "Partage avec les vendeurs, livreurs et prestataires", "Vos droits et comment les exercer", "Mesure d'audience du site (sans cookies tiers)"]} />;
}
