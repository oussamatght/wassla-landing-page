import "server-only";
import { cache } from "react";
import { publicEnv } from "@/lib/env";
import { ApiError } from "@/services/api/client";
import { api, type CatalogueQuery, type ProvidersQuery } from "@/services/api/endpoints";
import type {
  BoostPacksDTO,
  ProductCardDTO,
  ProductDetailDTO,
  ProductListDTO,
  ProviderDetailDTO,
  ProviderListDTO,
  SettingsDTO,
  StatsDTO,
  TradeDTO,
} from "@/services/api/schemas";
import * as F from "@/fixtures/landing";

/**
 * The ONLY bridge between pages and data. Real API by default; flagged dev
 * fixtures when NEXT_PUBLIC_USE_FIXTURES=true (rule 8). Returns
 * `{ data, error }` so every page can render a real error state instead of
 * crashing or silently showing nothing.
 */
export interface Loaded<T> {
  data: T | null;
  error: null | { kind: string; status: number; message: string };
}

async function load<T>(real: () => Promise<T>, fixture: () => T): Promise<Loaded<T>> {
  if (publicEnv.useFixtures) return { data: fixture(), error: null };
  try {
    return { data: await real(), error: null };
  } catch (e) {
    if (e instanceof ApiError) return { data: null, error: { kind: e.kind, status: e.status, message: e.message } };
    return { data: null, error: { kind: "unknown", status: 0, message: "Unexpected error" } };
  }
}

const page = <T,>(items: T[]) => ({ page: 1, limit: items.length || 24, total: items.length, pages: 1 });

export const dataSource = {
  settings: (): Promise<Loaded<SettingsDTO>> => load(api.settings, () => F.FIXTURE_SETTINGS),
  stats: (): Promise<Loaded<StatsDTO>> => load(api.stats, () => F.FIXTURE_STATS),
  products: (q: CatalogueQuery): Promise<Loaded<ProductListDTO>> =>
    load(
      () => api.products(q),
      () => {
        const items = F.FIXTURE_PRODUCTS.filter((p) => !q.sector || p.sector === q.sector);
        return { products: items, pagination: page(items) };
      },
    ),
  // cache(): generateMetadata and the page share ONE request per render.
  product: cache((id: string): Promise<Loaded<ProductDetailDTO>> => load(() => api.product(id), () => ({ ...F.FIXTURE_PRODUCT_DETAIL, id }))),
  relatedProducts: (id: string): Promise<Loaded<ProductCardDTO[]>> => load(() => api.relatedProducts(id), () => F.FIXTURE_PRODUCTS.slice(1, 5)),
  sponsored: (limit?: number, filters: { sector?: string; category?: string } = {}): Promise<Loaded<ProductCardDTO[]>> =>
    load(
      () => api.sponsored(limit, filters),
      () => F.FIXTURE_SPONSORED.filter((p) => (!filters.sector || p.sector === filters.sector) && (!filters.category || p.category === filters.category)),
    ),
  trades: (): Promise<Loaded<TradeDTO[]>> => load(api.trades, () => F.FIXTURE_TRADES),
  providers: (q: ProvidersQuery): Promise<Loaded<ProviderListDTO>> =>
    load(
      () => api.providers(q),
      () => ({ promoted: F.FIXTURE_PROVIDERS.filter((p) => p.promoted), listings: F.FIXTURE_PROVIDERS, pagination: page(F.FIXTURE_PROVIDERS) }),
    ),
  // cache(): the provider endpoint increments the view counter — without it every page
  // view was counted twice (metadata + page).
  provider: cache((id: string): Promise<Loaded<ProviderDetailDTO>> => load(() => api.provider(id), () => ({ ...F.FIXTURE_PROVIDER_DETAIL, id }))),
  boostPacks: (): Promise<Loaded<BoostPacksDTO>> => load(api.boostPacks, () => F.FIXTURE_BOOST),
};

export function isNotFound(error: Loaded<unknown>["error"]): boolean {
  return Boolean(error && error.status === 404);
}
