import Link from "next/link";
import { dataSource } from "@/services/data-source";
import { toProductSummary } from "@/services/api/adapters";
import type { CatalogueQuery } from "@/services/api/endpoints";
import { WILAYAS } from "@/lib/wilayas";
import { PART_CATEGORIES, categoryLabel } from "@/lib/categories";
import { SECTOR_LABELS } from "@/lib/labels";
import { SORT_OPTIONS, activeFilterCount, hrefWith } from "@/features/catalogue/params";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { FiltersDrawer } from "@/components/marketplace/FiltersDrawer";
import { ErrorState } from "@/components/ui/States";
import { EmptyState } from "@/components/ui/StaticStates";
import { ApiErrorHint } from "@/components/ui/ApiErrorHint";
import { SponsoredBadge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { SearchBar } from "@/components/ui/SearchBar";
import { RemovableChipLink } from "@/components/marketplace/RemovableChipLink";
import { controlClasses } from "@/components/ui/Field";
import { buttonClasses } from "@/components/ui/Button";

interface CatalogueViewProps {
  basePath: string;
  query: CatalogueQuery;
  /** Set on /categories/[slug]: the sector is part of the route, not a filter. */
  fixedSector?: string;
}

function FilterForm({ basePath, query, fixedSector, idPrefix }: CatalogueViewProps & { idPrefix: string }) {
  const id = (n: string) => `${idPrefix}-${n}`;
  const label = "mb-1.5 block text-sm font-medium";
  return (
    <form action={basePath} method="get" className="space-y-5" aria-label="Filtres du catalogue">
      {query.q && <input type="hidden" name="q" value={query.q} />}
      {query.sort && <input type="hidden" name="sort" value={query.sort} />}
      {!fixedSector && (
        <fieldset>
          <legend className={label}>Type de véhicule</legend>
          <div className="flex flex-wrap gap-2">
            {[["", "Tous"], ["automobile", "Automobile"], ["moto", "Motos"], ["poids_lourd", "Poids lourds"]].map(([value, text]) => (
              <label key={value} className="relative">
                <input type="radio" name="sector" value={value} defaultChecked={(query.sector ?? "") === value} className="peer sr-only" />
                <span className="inline-flex min-h-9 cursor-pointer items-center rounded-full border border-border px-3.5 text-sm text-text-secondary peer-checked:border-accent/70 peer-checked:bg-accent/10 peer-checked:text-text-primary peer-focus-visible:outline-2 peer-focus-visible:outline-focus">
                  {text}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <div>
        <label htmlFor={id("category")} className={label}>Catégorie</label>
        <select id={id("category")} name="category" defaultValue={query.category ?? ""} className={controlClasses}>
          <option value="">Toutes les catégories</option>
          <optgroup label="Catégories">
            {PART_CATEGORIES.filter((c) => c.group === "classic").map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </optgroup>
          <optgroup label="Nomenclature constructeur">
            {PART_CATEGORIES.filter((c) => c.group === "pro").map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </optgroup>
        </select>
      </div>
      <div>
        <label htmlFor={id("brand")} className={label}>Marque de la pièce</label>
        <input id={id("brand")} name="brand" defaultValue={query.brand} maxLength={60} placeholder="Ex. Bosch, Valeo…" className={controlClasses} />
      </div>
      <div>
        <label htmlFor={id("ref")} className={label}>Référence / OEM</label>
        <input id={id("ref")} name="ref" defaultValue={query.ref} maxLength={64} placeholder="Ex. 1K0698151" className={`${controlClasses} font-mono`} />
      </div>
      <div>
        <label htmlFor={id("condition")} className={label}>État</label>
        <select id={id("condition")} name="condition" defaultValue={query.condition ?? ""} className={controlClasses}>
          <option value="">Neuf et occasion</option>
          <option value="new">Neuf</option>
          <option value="used">Occasion</option>
        </select>
      </div>
      <fieldset>
        <legend className={label}>Prix (DA)</legend>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor={id("priceMin")} className="sr-only">Prix minimum</label>
            <input id={id("priceMin")} name="priceMin" inputMode="numeric" pattern="\d*" defaultValue={query.priceMin} placeholder="Min" className={`${controlClasses} tabular`} />
          </div>
          <div>
            <label htmlFor={id("priceMax")} className="sr-only">Prix maximum</label>
            <input id={id("priceMax")} name="priceMax" inputMode="numeric" pattern="\d*" defaultValue={query.priceMax} placeholder="Max" className={`${controlClasses} tabular`} />
          </div>
        </div>
      </fieldset>
      <div>
        <label htmlFor={id("wilaya")} className={label}>Wilaya</label>
        <select id={id("wilaya")} name="wilaya" defaultValue={query.wilaya ?? ""} className={controlClasses}>
          <option value="">Toutes les wilayas</option>
          {WILAYAS.map((w, i) => <option key={w} value={w}>{String(i + 1).padStart(2, "0")} — {w}</option>)}
        </select>
      </div>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
        <input type="checkbox" name="inStock" value="true" defaultChecked={query.inStock === "true"} className="h-5 w-5 accent-[var(--accent)]" />
        Disponible uniquement
      </label>
      <div className="flex flex-col gap-2 pt-1">
        <button type="submit" className={buttonClasses("primary", "md", "w-full")}>Appliquer les filtres</button>
        <Link href={hrefWith(basePath, { q: query.q })} className={buttonClasses("ghost", "md", "w-full")}>Réinitialiser</Link>
      </div>
    </form>
  );
}

async function SponsoredStrip({ sector, category }: { sector?: string; category?: string }) {
  const { data } = await dataSource.sponsored(4, { sector, category });
  if (!data || data.length === 0) return null; // never filler or fake sponsored content
  return (
    <section aria-labelledby="sponsorises-catalogue" className="space-y-3 rounded-lg border border-border bg-surface-1/50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="sponsorises-catalogue" className="text-base font-semibold">Produits sponsorisés</h2>
        <SponsoredBadge />
        <p className="w-full text-xs text-text-muted sm:ml-auto sm:w-auto">Mise en avant payante par les vendeurs, en rotation équitable.</p>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {data.map((p) => <li key={p.id}><ProductCard product={toProductSummary(p)} /></li>)}
      </ul>
    </section>
  );
}

export async function CatalogueView({ basePath, query, fixedSector }: CatalogueViewProps) {
  const { data, error } = await dataSource.products(query);
  const count = activeFilterCount(query, fixedSector);
  const q = query as Record<string, string | number | undefined>;

  const chips: Array<{ key: string; label: string }> = [];
  if (query.sector && !fixedSector) chips.push({ key: "sector", label: SECTOR_LABELS[query.sector as keyof typeof SECTOR_LABELS] ?? query.sector });
  if (query.category) chips.push({ key: "category", label: categoryLabel(query.category) ?? query.category });
  if (query.condition) chips.push({ key: "condition", label: query.condition === "new" ? "Neuf" : "Occasion" });
  if (query.wilaya) chips.push({ key: "wilaya", label: query.wilaya });
  if (query.brand) chips.push({ key: "brand", label: `Marque : ${query.brand}` });
  if (query.ref) chips.push({ key: "ref", label: `Réf. ${query.ref}` });
  if (query.priceMin) chips.push({ key: "priceMin", label: `≥ ${query.priceMin} DA` });
  if (query.priceMax) chips.push({ key: "priceMax", label: `≤ ${query.priceMax} DA` });
  if (query.inStock) chips.push({ key: "inStock", label: "Disponible" });

  const total = data?.pagination.total ?? 0;
  const products = data?.products.map(toProductSummary) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <SearchBar action={basePath} defaultValue={query.q} size="md" className="max-w-xl" hidden={Object.fromEntries(Object.entries({ sector: fixedSector ? undefined : query.sector, category: query.category, wilaya: query.wilaya }).filter(([, v]) => v)) as Record<string, string>} />
        <div className="flex items-center gap-2">
          <FiltersDrawer count={count}>
            <FilterForm basePath={basePath} query={query} fixedSector={fixedSector} idPrefix="m" />
          </FiltersDrawer>
          <form action={basePath} method="get" className="flex items-center gap-2">
            {Object.entries(q).filter(([k, v]) => v !== undefined && !["sort", "page", "limit"].includes(k)).map(([k, v]) => <input key={k} type="hidden" name={k} value={String(v)} />)}
            <label htmlFor="tri" className="sr-only">Trier par</label>
            <select id="tri" name="sort" defaultValue={query.sort ?? "newest"} className={`${controlClasses} min-h-11 w-auto`}>
              {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button type="submit" className={buttonClasses("secondary", "md")}>Trier</button>
          </form>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-lg border border-border bg-surface-1/60 p-5">
            <h2 className="mb-4 font-mono text-xs tracking-[0.2em] text-text-muted uppercase">Filtres</h2>
            <FilterForm basePath={basePath} query={query} fixedSector={fixedSector} idPrefix="d" />
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          {chips.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Filtres actifs">
              {chips.map((c) => (
                <li key={c.key}>
                  <RemovableChipLink label={c.label} href={hrefWith(basePath, q, [c.key, "page"])} />
                </li>
              ))}
            </ul>
          )}

          <p className="text-sm text-text-secondary" aria-live="polite">
            {error ? "" : `${total.toLocaleString("fr-FR")} annonce${total > 1 ? "s" : ""}${query.q ? ` pour « ${query.q} »` : ""}`}
            {data?.searchedAsVin && " — recherche par numéro VIN"}
          </p>

          {!error && (query.page ?? 1) === 1 && !query.q && <SponsoredStrip sector={query.sector} category={query.category} />}

          {error ? (
            <ErrorState
              title="Le catalogue est momentanément indisponible"
              description="Nous n'avons pas pu joindre le serveur WASSLA. Réessayez dans un instant ou consultez les annonces dans l'application."
              action={<a href={hrefWith(basePath, q)} className={buttonClasses("secondary")}>Réessayer</a>}>
              <ApiErrorHint error={error} />
            </ErrorState>
          ) : products.length === 0 && data?.searchedAsVin ? (
            <EmptyState
              title="Aucune annonce n'est liée à ce numéro VIN"
              description="Les vendeurs n'ont encore associé aucune pièce à ce VIN. Recherchez par référence OEM ou par nom de pièce, ou vérifiez la compatibilité avec le vendeur dans l'application."
              action={<Link href={hrefWith(basePath, {})} className={buttonClasses("secondary")}>Nouvelle recherche</Link>}
            />
          ) : products.length === 0 ? (
            <EmptyState
              title="Aucune pièce ne correspond à votre recherche"
              description="Essayez une autre référence, élargissez la wilaya ou retirez un filtre. De nouvelles annonces sont publiées chaque jour dans l'application."
              action={<Link href={hrefWith(basePath, {})} className={buttonClasses("secondary")}>Réinitialiser les filtres</Link>}
            />
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {products.map((p, i) => (
                <li key={p.id}>
                  <ProductCard product={p} priority={i < 4} />
                </li>
              ))}
            </ul>
          )}

          {data && data.pagination.pages > 1 && (
            <Pagination page={data.pagination.page} totalPages={Math.min(data.pagination.pages, 500)} hrefForPage={(p) => hrefWith(basePath, { ...q, page: p })} />
          )}
        </div>
      </div>
    </div>
  );
}
