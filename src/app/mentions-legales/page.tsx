import type { Metadata } from "next";
import { LegalPlaceholder } from "@/components/layout/LegalPlaceholder";

export const metadata: Metadata = { title: "Mentions légales", robots: { index: false } };

export default function Page() {
  return <LegalPlaceholder title="Mentions légales" sections={["Éditeur du site et de l'application", "Hébergement", "Propriété intellectuelle", "Contact"]} />;
}
