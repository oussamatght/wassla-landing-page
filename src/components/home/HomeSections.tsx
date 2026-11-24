import Image from "next/image";
import Link from "next/link";
import { dataSource } from "@/services/data-source";
import { toProductSummary, toProviderSummary } from "@/services/api/adapters";
import type { SettingsDTO } from "@/services/api/schemas";
import { Section } from "@/components/layout/PageHeader";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { ProviderCard } from "@/components/providers/ProviderCard";
import { StoreBadges } from "@/components/app-showcase/StoreBadges";
import { SponsoredBadge } from "@/components/ui/Badge";
import { Faq } from "@/components/ui/Faq";
import { buttonClasses } from "@/components/ui/Button";
import { APP_FEATURES, FAQ } from "@/features/editorial/content";
import { fr } from "@/i18n/fr";

const DEFAULT_ORDER = ["stats", "sponsored", "latest", "categories", "providers", "howItWorks", "app", "boost", "faq"];

async function Stats() {
  const { data } = await dataSource.stats();
  // Real counters only; hidden until the platform has data (never placeholder numbers).
  if (!data || data.products === 0) return null;
  const items = [
    [data.products, "annonces de pièces"],
    [data.sellers, "vendeurs actifs"],
    [data.wilayas, "wilayas représentées"],
    [data.providers, "prestataires publiés"],
  ].filter(([n]) => Number(n) > 0) as Array<[number, string]>;
  return (
    <section aria-label="WASSLA en chiffres" className="border-b border-border">
      <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        {items.map(([n, label]) => (
          <div key={label} className="space-y-1">
            <dt className="text-sm text-text-secondary">{label}</dt>
            <dd className="tabular font-display text-4xl font-semibold text-signature">{n.toLocaleString("fr-FR")}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

async function Sponsored() {
  const { data } = await dataSource.sponsored(8);
  if (!data || data.length === 0) return null; // no fake grid
  return (
    <Section id="sponsorises" kicker="Mis en avant par les vendeurs" title="Produits sponsorisés" action={<SponsoredBadge />}>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {data.slice(0, 8).map((p) => <li key={p.id}><ProductCard product={toProductSummary(p)} /></li>)}
      </ul>
    </Section>
  );
}

async function Latest() {
  const { data } = await dataSource.products({ sort: "newest", limit: 8, page: 1 });
  if (!data || data.products.length === 0) return null;
  return (
    <Section id="nouveautes" kicker="Catalogue" title="Dernières annonces" action={<Link href="/catalogue" className={buttonClasses("secondary")}>Tout le catalogue</Link>}>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {data.products.map((p) => <li key={p.id}><ProductCard product={toProductSummary(p)} /></li>)}
      </ul>
    </Section>
  );
}

function Categories() {
  const cards = [
    { href: "/categories/automobile", img: "/fallbacks/chapter-1-automobile.webp", ...fr.categories.automobile, code: "01" },
    { href: "/categories/motos", img: "/fallbacks/chapter-2-moto.webp", ...fr.categories.moto, code: "02" },
    { href: "/categories/poids-lourds", img: "/fallbacks/chapter-3-heavy.webp", ...fr.categories.heavy, code: "03" },
  ];
  return (
    <Section id="univers" kicker="Trois univers" title="Automobile, motos et poids lourds">
      <ul className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <li key={c.href}>
            <Link href={c.href} className="group relative block aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-surface-1">
              <Image src={c.img} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" unoptimized className="object-cover object-right opacity-80 transition-transform duration-(--duration-slow) group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 space-y-1 p-5">
                <p className="font-mono text-xs text-accent">{c.code}</p>
                <h3 className="text-2xl font-semibold">{c.title}</h3>
                <p className="text-sm text-text-secondary">{c.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

async function Providers() {
  const { data } = await dataSource.providers({ page: 1, limit: 6 });
  const items = data ? [...data.promoted, ...data.listings.filter((l) => !data.promoted.some((p) => p.id === l.id))].slice(0, 3) : [];
  return (
    <Section
      id="prestataires-une"
      kicker="Prestataires à la une"
      title="Des pros qui viennent jusqu'à vous"
      description="Lavage, diagnostic, vidange, mécanique mobile, dépannage : contactez-les directement par téléphone ou WhatsApp."
      action={<Link href="/prestataires" className={buttonClasses("secondary")}>Tous les prestataires</Link>}>
      {items.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((l) => <li key={l.id}><ProviderCard listing={toProviderSummary(l)} /></li>)}
        </ul>
      ) : (
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-border-strong p-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-text-secondary">Vous êtes prestataire automobile ? Publiez votre annonce et soyez parmi les premiers visibles dans votre wilaya.</p>
          <Link href="/prestataires/publier" className={buttonClasses("primary")}>Publier une annonce</Link>
        </div>
      )}
    </Section>
  );
}

function HowItWorks() {
  return (
    <Section id="fonctionnement" kicker="Comment ça marche" title="De la recherche à la livraison" action={<Link href="/comment-ca-marche" className={buttonClasses("secondary")}>En savoir plus</Link>}>
      <ol className="grid gap-4 md:grid-cols-4">
        {[
          ["Recherchez", "Par nom, référence OEM ou numéro VIN."],
          ["Commandez", "Dans l'application, livraison chiffrée avant validation."],
          ["Suivez", "Le livreur en direct sur la carte."],
          ["Recevez", "Remise confirmée par code, retours encadrés."],
        ].map(([t, d], i) => (
          <li key={t} className="rounded-xl border border-border p-5">
            <p className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="mt-2 font-semibold">{t}</h3>
            <p className="mt-1 text-sm text-text-secondary">{d}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function AppShowcase() {
  return (
    <Section id="application" kicker="Application mobile" title="WASSLA est disponible dès aujourd'hui.">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <ul className="grid gap-4 sm:grid-cols-2">
            {APP_FEATURES.slice(0, 4).map((f) => (
              <li key={f.title} className="rounded-xl border border-border bg-surface-1/60 p-5">
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-text-secondary">{f.body}</p>
              </li>
            ))}
          </ul>
          <StoreBadges placement="home-app" />
        </div>
        <div className="relative mx-auto w-[240px] [perspective:1200px]" aria-hidden="true">
          <div className="rounded-[2.4rem] border border-border-strong bg-surface-2 p-3 shadow-2xl motion-safe:[transform:rotateY(-14deg)_rotateX(5deg)]">
            <div className="flex aspect-[9/19] flex-col items-center justify-center gap-4 rounded-[1.9rem] bg-[radial-gradient(circle_at_50%_30%,#0a1a6b,#020523_70%)]">
              <Image src="/brand/wassla-app-icon-192.webp" alt="" width={88} height={88} unoptimized className="rounded-[22%]" />
              <p className="font-display text-lg font-semibold tracking-[0.1em]">WASSLA</p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function BoostTeaser({ enabled }: { enabled: boolean }) {
  return (
    <Section id="boost-vendeurs" kicker="Vendeurs" title="Vendez gratuitement, boostez si vous le souhaitez">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Publication gratuite", "Mettez vos pièces en ligne sans frais depuis l'application."],
          ["Boost en option", "Vos produits dans les emplacements « Sponsorisé », en rotation équitable."],
          ["Sans engagement", "Achetez un pack quand vous voulez ; le Boost ne garantit pas de ventes."],
        ].map(([t, d]) => (
          <div key={t} className="rounded-xl border border-border p-5">
            <h3 className="font-semibold">{t}</h3>
            <p className="mt-1 text-sm text-text-secondary">{d}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/vendre" className={buttonClasses("primary")}>Devenir vendeur</Link>
        <Link href="/boost" className={buttonClasses("secondary")}>{enabled ? "Voir les packs Boost" : "Boost — bientôt disponible"}</Link>
      </div>
    </Section>
  );
}

function FaqTeaser() {
  return (
    <Section id="faq-accueil" kicker="Questions fréquentes" title="Vous vous demandez…" action={<Link href="/faq" className={buttonClasses("secondary")}>Toutes les questions</Link>}>
      <div className="max-w-3xl"><Faq items={FAQ.slice(0, 4)} /></div>
    </Section>
  );
}

function FinalCta() {
  return (
    <section aria-labelledby="cta-final" className="blueprint-grid">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-20 text-center">
        <h2 id="cta-final" className="text-3xl font-semibold sm:text-4xl">Trouvez votre pièce maintenant.</h2>
        <p className="text-lg text-text-secondary">Recherchez sur le site, commandez et faites-vous livrer avec l&apos;application.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/catalogue" className={buttonClasses("primary", "lg")}>Explorer les pièces</Link>
          <Link href="/telecharger" className={buttonClasses("secondary", "lg")}>Télécharger l&apos;app</Link>
        </div>
      </div>
    </section>
  );
}

/** Home sections in the admin-defined order (defaults when settings are absent). */
export async function HomeSections({ settings }: { settings: SettingsDTO | null }) {
  const configured = settings?.sections?.length ? settings.sections : null;
  const enabled = (key: string) => !configured || configured.find((s) => s.key === key)?.enabled !== false;
  // "categories" is not admin-configurable: it always follows "latest".
  const rank = (key: string): number => {
    if (!configured) return DEFAULT_ORDER.indexOf(key);
    if (key === "categories") return rank("latest") + 0.5;
    return configured.find((s) => s.key === key)?.order ?? 99;
  };
  const order = [...DEFAULT_ORDER].sort((a, b) => rank(a) - rank(b));
  const providersOn = settings?.flags?.providers !== false;
  const render: Record<string, React.ReactNode> = {
    stats: <Stats key="stats" />,
    sponsored: <Sponsored key="sponsored" />,
    latest: <Latest key="latest" />,
    categories: <Categories key="categories" />,
    providers: providersOn ? <Providers key="providers" /> : null,
    howItWorks: <HowItWorks key="how" />,
    app: <AppShowcase key="app" />,
    boost: <BoostTeaser key="boost" enabled={Boolean(settings?.boost.salesEnabled)} />,
    faq: <FaqTeaser key="faq" />,
  };
  return (
    <>
      {order.filter((k) => k === "categories" || enabled(k)).map((k) => render[k])}
      <FinalCta />
    </>
  );
}
