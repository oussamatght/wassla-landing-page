/**
 * View models consumed by UI components. They are produced by the adapters in
 * src/services/ from zod-validated backend responses (or flagged fixtures),
 * never typed by hand in components.
 */

/** Mirrors the backend vehicle sector list. */
export type VehicleSector = "automobile" | "moto" | "poids_lourd";

export type ProductCondition = "new" | "used";

export interface ProductSummary {
  id: string;
  title: string;
  priceDA: number;
  condition: ProductCondition;
  sector: VehicleSector;
  imageUrl?: string;
  /** Short reference (manufacturer reference or OEM) when the seller supplied one. */
  reference?: string;
  sellerName?: string;
  wilaya?: string;
  inStock: boolean;
  /** True only when the backend reports an active, paid boost. */
  sponsored: boolean;
}

export type InterventionMode = "domicile" | "lieu_de_travail" | "atelier" | "mobile";

export type PricingKind = "fixed" | "from" | "quote" | "undisclosed";

export interface ProviderListingSummary {
  id: string;
  title: string;
  businessName: string;
  tradeLabel: string;
  wilaya: string;
  commune?: string;
  vehicleTypes: VehicleSector[];
  interventionModes: InterventionMode[];
  pricing: { kind: PricingKind; amountDA?: number };
  coverImageUrl?: string;
  /** True only during an admin-activated paid promotion window. */
  promoted: boolean;
}
