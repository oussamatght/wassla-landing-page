import type { InterventionMode, PricingKind, ProductCondition, VehicleSector } from "@/types/domain";
import { formatPriceDA } from "@/lib/format";

export const SECTOR_LABELS: Record<VehicleSector, string> = {
  automobile: "Automobile",
  moto: "Moto",
  poids_lourd: "Poids lourds",
};

/** URL slug ↔ backend sector value (routes /categories/<slug>). */
export const SECTOR_SLUGS = {
  automobile: "automobile",
  motos: "moto",
  "poids-lourds": "poids_lourd",
} as const satisfies Record<string, VehicleSector>;

export type SectorSlug = keyof typeof SECTOR_SLUGS;

export const CONDITION_LABELS: Record<ProductCondition, string> = {
  new: "Neuf",
  used: "Occasion",
};

export const INTERVENTION_LABELS: Record<InterventionMode, string> = {
  domicile: "À domicile",
  lieu_de_travail: "Sur le lieu de travail",
  atelier: "En atelier",
  mobile: "Mobile",
};

export function pricingLabel(pricing: { kind: PricingKind; amountDA?: number }): string {
  switch (pricing.kind) {
    case "fixed":
      return pricing.amountDA !== undefined ? formatPriceDA(pricing.amountDA) : "Prix fixe";
    case "from":
      return pricing.amountDA !== undefined ? `À partir de ${formatPriceDA(pricing.amountDA)}` : "Prix variable";
    case "quote":
      return "Devis sur demande";
    case "undisclosed":
    default:
      return "Prix non communiqué";
  }
}
