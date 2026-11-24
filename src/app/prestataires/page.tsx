import type { Metadata } from "next";
import Link from "next/link";
import { dataSource } from "@/services/data-source";
import { toProviderSummary } from "@/services/api/adapters";
import { PageHeader, Section } from "@/components/layout/PageHeader";
import { ProviderCard } from "@/components/providers/ProviderCard";
import { ErrorState } from "@/components/ui/States";
import { EmptyState } from "@/components/ui/StaticStates";
import { ApiErrorHint } from "@/components/ui/ApiErrorHint";
import { Pagination } from "@/components/ui/Pagination";
import { SponsoredBadge } from "@/components/ui/Badge";
import { controlClasses } from "@/components/ui/Field";
import { buttonClasses } from "@/components/ui/Button";
import { WILAYAS } from "@/lib/wilayas";
import { INTERVENTION_LABELS, SECTOR_LABELS } from "@/lib/labels";
import { hrefWith, type SearchParams } from "@/features/catalogue/params";
import { RemovableChipLink } from "@/components/marketplace/RemovableChipLink";

export const metadata: Metadata = {
  title: "Prestataires automobiles à domicile",
  description: "Lavage, diagnostic, vidange, mécanique mobile, dépannage… Trouvez un prestataire près de chez vous et contactez-le directement.",
  alternates: { canonical: "/prestataires" },
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

export default async function ProvidersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const query = {
    q: first(sp.q)?.slice(0, 80),
    trade: first(sp.trade),
    wilaya: first(sp.wilaya) && (WILAYAS as readonly string[]).includes(first(sp.wilaya)!) ? first(sp.wilaya) : undefined,
    vehicleType: ["automobile", "moto", "poids_lourd"].includes(first(sp.vehicleType) ?? "") ? first(sp.vehicleType) : undefined,
    mode: Object.keys(INTERVENTION_LABELS).includes(first(sp.mode) ?? "") ? first(sp.mode) : undefined,
    page: Math.max(1, Number.parseInt(first(sp.page) ?? "1", 10) || 1),
  };
  const [{ data, error }, { data: trades }] = await Promise.all([dataSource.providers(query), dataSource.trades()]);
  const q = query as Record<string, string | number | undefined>;
  const tradeLabel = (key?: string) => trades?.find((t) => t.key === key)?.label ?? key;

  const chips = [
    query.trade && { key: "trade", label: tradeLabel(query.trade)! },
    query.wilaya && { key: "wilaya", label: query.wilaya },
    query.vehicleType && { key: "vehicleType", label: SECTOR_LABELS[query.vehicleType as keyof typeof SECTOR_LABELS] },
    query.mode && { key: "mode", label: INTERVENTION_LABELS[query.mode as keyof typeof INTERVENTION_LABELS] },
    query.q && { key: "q", label: `« ${query.q} »` },
  ].filter(Boolean) as Array<{ key: string; label: string }>;

  return (
    <>
      <PageHeader
        kicker="Prestataires"
        title="Les pros de l'auto qui viennent à vous"
        description="Lavage, diagnostic, vidange, mécanique mobile, dépannage… Contactez directement le prestataire par téléphone ou WhatsApp : il confirme lui-même sa disponibilité."
        crumbs={[{ href: "/", label: "Accueil" }, { label: "Prestataires" }]}>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/prestataires/publier" className={buttonClasses("primary", "lg")}>Publier une annonce de prestation</Link>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <form action="/prestataires" method="get" className="grid gap-3 rounded-xl border border-border bg-surface-1/60 p-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto]" aria-label="Rechercher un prestataire">
          <div>
            <label htmlFor="p-q" className="sr-only">Mot-clé</label>
            <input id="p-q" name="q" defaultValue={query.q} maxLength={80} placeholder="Nom, mot-clé…" className={controlClasses} />
          </div>
          <div>
            <label htmlFor="p-trade" className="sr-only">Métier</label>
            <select id="p-trade" name="trade" defaultValue={query.trade ?? ""} className={controlClasses}>
              <option value="">Tous les métiers</option>
              {(trades ?? []).map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="p-wilaya" className="sr-only">Wilaya</label>
            <select id="p-wilaya" name="wilaya" defaultValue={query.wilaya ?? ""} className={controlClasses}>
              <option value="">Toutes les wilayas</option>
              {WILAYAS.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="p-vt" className="sr-only">Véhicule</label>
            <select id="p-vt" name="vehicleType" defaultValue={query.vehicleType ?? ""} className={controlClasses}>
              <option value="">Tous véhicules</option>
              {Object.entries(SECTOR_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="p-mode" className="sr-only">Intervention</label>
            <select id="p-mode" name="mode" defaultValue={query.mode ?? ""} className={controlClasses}>
              <option value="">Tout mode d&apos;intervention</option>
              {Object.entries(INTERVENTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button type="submit" className={buttonClasses("primary", "md")}>Rechercher</button>
        </form>

        {chips.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Filtres actifs">
            {chips.map((c) => <li key={c.key}><RemovableChipLink label={c.label} href={hrefWith("/prestataires", q, [c.key, "page"])} /></li>)}
          </ul>
        )}

        <div className="mt-8 space-y-10">
          {error ? (
            <ErrorState title="L'annuaire des prestataires est momentanément indisponible" description="Réessayez dans un instant." action={<a href={hrefWith("/prestataires", q)} className={buttonClasses("secondary")}>Réessayer</a>}>
              <ApiErrorHint error={error} />
            </ErrorState>
          ) : (
            <>
              {data && data.promoted.length > 0 && (
                <section aria-labelledby="mis-en-avant" className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h2 id="mis-en-avant" className="text-lg font-semibold">Mis en avant</h2>
                    <SponsoredBadge label="Annonces sponsorisées" />
                  </div>
                  <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {data.promoted.map((l) => <li key={l.id}><ProviderCard listing={toProviderSummary(l)} /></li>)}
                  </ul>
                </section>
              )}
              <section aria-labelledby="toutes" className="space-y-4">
                <h2 id="toutes" className="text-lg font-semibold" aria-live="polite">
                  {data ? `${data.pagination.total} annonce${data.pagination.total > 1 ? "s" : ""}` : ""}
                </h2>
                {data && data.listings.length === 0 ? (
                  <EmptyState
                    title="Aucun prestataire pour ces critères"
                    description="Élargissez la wilaya ou le métier. Vous êtes prestataire ? Publiez la première annonce de votre zone."
                    action={<Link href="/prestataires/publier" className={buttonClasses("secondary")}>Publier une annonce</Link>}
                  />
                ) : (
                  <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Page 1: listings already shown under "Mis en avant" are not repeated. */}
                    {data?.listings.filter((l) => !data.promoted.some((p) => p.id === l.id)).map((l) => <li key={l.id}><ProviderCard listing={toProviderSummary(l)} /></li>)}
                  </ul>
                )}
              </section>
              {data && data.pagination.pages > 1 && (
                <Pagination page={data.pagination.page} totalPages={data.pagination.pages} hrefForPage={(p) => hrefWith("/prestataires", { ...q, page: p })} />
              )}
            </>
          )}
        </div>
      </div>

      <Section kicker="Bon à savoir" title="Comment ça marche ?">
        <ol className="grid gap-4 md:grid-cols-3">
          {[
            ["01", "Choisissez un prestataire", "Comparez les métiers, zones d'intervention, types de véhicules et tarifs indicatifs."],
            ["02", "Contactez-le directement", "Appelez ou écrivez sur WhatsApp. Le prestataire confirme lui-même sa disponibilité et son prix."],
            ["03", "Précisez l'intervention", "Adresse, véhicule, horaires et éventuels frais de déplacement : tout se convient entre vous."],
          ].map(([n, t, d]) => (
            <li key={n} className="rounded-xl border border-border p-5">
              <p className="font-mono text-xs text-accent">{n}</p>
              <h3 className="mt-2 font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-text-secondary">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-text-muted">
          La publication d&apos;une annonce ne vaut pas confirmation d&apos;une intervention. WASSLA met en relation ; la prestation est convenue directement avec le professionnel.
        </p>
      </Section>
    </>
  );
}
