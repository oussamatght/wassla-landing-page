import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";
import { api } from "@/services/api/endpoints";

export const revalidate = 3600;

const STATIC_ROUTES: Array<[string, number]> = [
  ["", 1],
  ["/catalogue", 0.9],
  ["/categories/automobile", 0.8],
  ["/categories/motos", 0.8],
  ["/categories/poids-lourds", 0.8],
  ["/prestataires", 0.8],
  ["/prestataires/publier", 0.5],
  ["/telecharger", 0.7],
  ["/comment-ca-marche", 0.5],
  ["/vendre", 0.6],
  ["/boost", 0.5],
  ["/faq", 0.5],
  ["/contact", 0.4],
];

/** Static pages + real product/provider URLs from the API (never fixtures). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = publicEnv.siteUrl.replace(/\/+$/, "");
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map(([path, priority]) => ({ url: `${base}${path}`, lastModified: now, changeFrequency: "daily", priority }));
  if (publicEnv.useFixtures) return entries;

  try {
    for (let page = 1; page <= 20; page++) {
      const res = await api.products({ page, limit: 48, sort: "newest" });
      for (const p of res.products) entries.push({ url: `${base}/products/${p.id}`, lastModified: p.createdAt ? new Date(p.createdAt) : now, changeFrequency: "weekly", priority: 0.6 });
      if (page >= res.pagination.pages) break;
    }
  } catch {
    // API unreachable: keep the static entries only.
  }
  try {
    for (let page = 1; page <= 10; page++) {
      const res = await api.providers({ page, limit: 48 });
      for (const l of res.listings) entries.push({ url: `${base}/prestataires/${l.id}`, lastModified: l.publishedAt ? new Date(l.publishedAt) : now, changeFrequency: "weekly", priority: 0.5 });
      if (page >= res.pagination.pages) break;
    }
  } catch {
    // ignore
  }
  return entries;
}
