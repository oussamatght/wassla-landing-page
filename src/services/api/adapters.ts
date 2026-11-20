import type { ProductCardDTO, ProviderCardDTO } from "@/services/api/schemas";
import type { ProductSummary, ProviderListingSummary } from "@/types/domain";

/** DTO → view model (components never consume raw backend shapes). */
export function toProductSummary(p: ProductCardDTO): ProductSummary {
  return {
    id: p.id,
    title: p.title,
    priceDA: p.priceDA,
    condition: p.condition,
    sector: p.sector,
    imageUrl: p.imageUrl,
    reference: p.reference,
    sellerName: p.sellerName,
    wilaya: p.wilaya,
    inStock: p.inStock,
    sponsored: p.sponsored,
  };
}

export function toProviderSummary(l: ProviderCardDTO): ProviderListingSummary {
  return {
    id: l.id,
    title: l.title,
    businessName: l.businessName,
    tradeLabel: l.tradeLabel,
    wilaya: l.wilaya,
    commune: l.commune,
    vehicleTypes: l.vehicleTypes,
    interventionModes: l.interventionModes,
    pricing: { kind: l.pricing.kind, amountDA: l.pricing.amountDA ?? undefined },
    coverImageUrl: l.coverImageUrl,
    promoted: l.promoted,
  };
}
