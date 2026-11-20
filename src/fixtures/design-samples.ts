import type { ProductSummary, ProviderListingSummary } from "@/types/domain";

/**
 * FICTIONAL samples used ONLY by the dev-only /design page to render
 * components. Not real products, sellers or providers; never served by the
 * public site. Titles are prefixed "Exemple" to make that obvious.
 */
export const SAMPLE_PRODUCTS: ProductSummary[] = [
  {
    id: "exemple-1",
    title: "Exemple — Kit plaquettes de frein avant (fictif)",
    priceDA: 6500,
    condition: "new",
    sector: "automobile",
    reference: "EX-0000-DEMO",
    sellerName: "Vendeur exemple",
    wilaya: "Alger",
    inStock: true,
    sponsored: true,
  },
  {
    id: "exemple-2",
    title: "Exemple — Chaîne de transmission moto 520 (fictif)",
    priceDA: 12500,
    condition: "used",
    sector: "moto",
    sellerName: "Vendeur exemple",
    wilaya: "Oran",
    inStock: false,
    sponsored: false,
  },
];

export const SAMPLE_PROVIDER: ProviderListingSummary = {
  id: "exemple-prestataire",
  title: "Exemple — Diagnostic automobile à domicile (fictif)",
  businessName: "Prestataire exemple",
  tradeLabel: "Diagnostic automobile à domicile",
  wilaya: "Blida",
  commune: "Boufarik",
  vehicleTypes: ["automobile", "moto"],
  interventionModes: ["domicile", "mobile"],
  pricing: { kind: "from", amountDA: 2500 },
  promoted: true,
};
