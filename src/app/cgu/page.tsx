import type { Metadata } from "next";
import { LegalPlaceholder } from "@/components/layout/LegalPlaceholder";

export const metadata: Metadata = { title: "Conditions générales d'utilisation", robots: { index: false } };

export default function Page() {
  return <LegalPlaceholder title="Conditions générales d'utilisation" sections={["Rôle de WASSLA (mise en relation, livraison)", "Comptes client, vendeur, livreur et prestataire", "Commandes, paiement, livraison et retours", "Annonces de prestataires et Boost", "Responsabilités et litiges"]} />;
}
