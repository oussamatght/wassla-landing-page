import type { CatalogueQuery } from "@/services/api/endpoints";
import { WILAYAS } from "@/lib/wilayas";
import { PART_CATEGORIES } from "@/lib/categories";
import { PAGE_SIZE } from "@/lib/constants";

export type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
const digits = (v?: string) => (v && /^\d{1,9}$/.test(v) ? v : undefined);

export const SORT_OPTIONS = [
  { value: "newest", label: "Plus récentes" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "popular", label: "Populaires" },
] as const;

/** Sanitises URL params into an API query (unknown values are dropped). */
export function parseCatalogueParams(sp: SearchParams, fixedSector?: string): CatalogueQuery {
  const sector = fixedSector ?? first(sp.sector);
  const category = first(sp.category);
  const wilaya = first(sp.wilaya);
  const condition = first(sp.condition);
  const sort = first(sp.sort);
  const page = Math.min(500, Math.max(1, Number.parseInt(first(sp.page) ?? "1", 10) || 1));
  return {
    q: first(sp.q)?.slice(0, 120),
    sector: sector && ["automobile", "moto", "poids_lourd"].includes(sector) ? sector : undefined,
    category: category && PART_CATEGORIES.some((c) => c.value === category) ? category : undefined,
    condition: condition === "new" || condition === "used" ? condition : undefined,
    wilaya: wilaya && (WILAYAS as readonly string[]).includes(wilaya) ? wilaya : undefined,
    brand: first(sp.brand)?.slice(0, 60),
    ref: first(sp.ref)?.slice(0, 64),
    priceMin: digits(first(sp.priceMin)),
    priceMax: digits(first(sp.priceMax)),
    inStock: first(sp.inStock) === "true" ? "true" : undefined,
    sort: sort && SORT_OPTIONS.some((s) => s.value === sort) ? sort : undefined,
    page,
    limit: PAGE_SIZE,
  };
}

/** href for `base` with the given query, minus empty values (and minus `page` unless > 1). */
export function hrefWith(base: string, query: Record<string, string | number | undefined>, omit: string[] = []): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (omit.includes(k) || v === undefined || v === "" || k === "limit") continue;
    if (k === "page" && Number(v) <= 1) continue;
    params.set(k, String(v));
  }
  const s = params.toString();
  return s ? `${base}?${s}` : base;
}

/** Number of user-set filters (for the mobile "Filtres (n)" button). */
export function activeFilterCount(q: CatalogueQuery, fixedSector?: string): number {
  const keys: Array<keyof CatalogueQuery> = ["category", "condition", "wilaya", "brand", "ref", "priceMin", "priceMax", "inStock"];
  return keys.filter((k) => q[k] !== undefined).length + (q.sector && !fixedSector ? 1 : 0);
}
