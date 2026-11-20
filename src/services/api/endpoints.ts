import { z } from "zod";
import { apiRequest } from "@/services/api/client";
import {
  boostOrderSchema,
  boostPacksSchema,
  productDetailSchema,
  productListSchema,
  productCardSchema,
  providerDetailSchema,
  providerListSchema,
  settingsSchema,
  statsSchema,
  tradeSchema,
} from "@/services/api/schemas";

/** Public landing routes (prefix /api/public/landing). */
const P = "/public/landing";

export interface CatalogueQuery {
  q?: string;
  sector?: string;
  category?: string;
  condition?: string;
  wilaya?: string;
  brand?: string;
  ref?: string;
  priceMin?: string;
  priceMax?: string;
  inStock?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ProvidersQuery {
  q?: string;
  trade?: string;
  wilaya?: string;
  commune?: string;
  vehicleType?: string;
  mode?: string;
  page?: number;
  limit?: number;
}

export const api = {
  settings: () => apiRequest(`${P}/settings`, z.object({ settings: settingsSchema }), { revalidate: 60, tags: ["settings"] }).then((d) => d.settings),
  stats: () => apiRequest(`${P}/stats`, z.object({ stats: statsSchema }), { revalidate: 300 }).then((d) => d.stats),
  products: (query: CatalogueQuery) =>
    apiRequest(`${P}/products`, productListSchema, { searchParams: { ...query }, revalidate: 30 }),
  product: (id: string) => apiRequest(`${P}/products/${encodeURIComponent(id)}`, z.object({ product: productDetailSchema }), { revalidate: 60 }).then((d) => d.product),
  relatedProducts: (id: string) =>
    apiRequest(`${P}/products/${encodeURIComponent(id)}/related`, z.object({ products: z.array(productCardSchema) }), { revalidate: 120 }).then((d) => d.products),
  sponsored: (limit = 8, filters: { sector?: string; category?: string } = {}) =>
    apiRequest(`${P}/sponsored`, z.object({ products: z.array(productCardSchema) }), { searchParams: { limit, ...filters }, revalidate: 60 }).then((d) => d.products),
  trades: () => apiRequest(`${P}/trades`, z.object({ trades: z.array(tradeSchema) }), { revalidate: 300 }).then((d) => d.trades),
  providers: (query: ProvidersQuery) => apiRequest(`${P}/providers`, providerListSchema, { searchParams: { ...query }, revalidate: 30 }),
  provider: (id: string) =>
    apiRequest(`${P}/providers/${encodeURIComponent(id)}`, z.object({ listing: providerDetailSchema }), { revalidate: 0 }).then((d) => d.listing),
  boostPacks: () => apiRequest(`${P}/boost/packs`, boostPacksSchema, { revalidate: 60 }),
  // Browser-only mutations (no caching):
  createBoostOrder: (body: { shopName: string; sellerId: string; phone: string; packId: string; website?: string }) =>
    apiRequest(`${P}/boost/orders`, z.object({ order: boostOrderSchema, whatsappNumber: z.string().optional() }), { method: "POST", body }),
  boostOrderStatus: (reference: string, phone: string) =>
    apiRequest(`${P}/boost/orders/${encodeURIComponent(reference)}`, z.object({ order: boostOrderSchema }), { searchParams: { phone } }).then((d) => d.order),
  reportListing: (id: string, body: { reason: string; message?: string; website?: string }) =>
    apiRequest(`${P}/providers/${encodeURIComponent(id)}/report`, z.object({ received: z.boolean() }), { method: "POST", body }),
};
