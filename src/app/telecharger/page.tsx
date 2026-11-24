import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader, Section, JsonLd } from "@/components/layout/PageHeader";
import { StoreBadges } from "@/components/app-showcase/StoreBadges";
import { APP_FEATURES } from "@/features/editorial/content";
import { STORE_LINKS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Télécharger l'application WASSLA",
  description: "WASSLA est disponible sur Google Play et l'App Store : commandez vos pièces, suivez la livraison en direct, gérez vos retours.",
  alternates: { canonical: "/telecharger" },
};

export default function DownloadPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "MobileApplication",
          name: "WASSLA",
          operatingSystem: "Android, iOS",
          applicationCategory: "ShoppingApplication",
          installUrl: [STORE_LINKS.googlePlay, STORE_LINKS.appStore],
          offers: { "@type": "Offer", price: 0, priceCurrency: "DZD" },
        }}
      />
      <PageHeader
        kicker="Application mobile"
        title="WASSLA est disponible dès aujourd'hui."
        description="Téléchargez l'application gratuite pour commander vos pièces, suivre la livraison en direct et gérer vos retours."
        crumbs={[{ href: "/", label: "Accueil" }, { label: "Télécharger" }]}>
        <StoreBadges placement="download-hero" className="pt-2" />
      </PageHeader>

      <Section kicker="Dans l'application" title="Tout ce que vous pouvez faire">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_340px]">
          <ul className="grid gap-4 sm:grid-cols-2">
            {APP_FEATURES.map((f) => (
              <li key={f.title} className="rounded-xl border border-border bg-surface-1/60 p-5">
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-text-secondary">{f.body}</p>
              </li>
            ))}
          </ul>
          {/* Branded placeholder: real app screenshots are a required asset (no faked UI). */}
          <div className="relative mx-auto w-[260px] [perspective:1200px]" aria-hidden="true">
            <div className="rounded-[2.4rem] border border-border-strong bg-surface-2 p-3 shadow-2xl motion-safe:[transform:rotateY(-12deg)_rotateX(4deg)]">
              <div className="flex aspect-[9/19] flex-col items-center justify-center gap-4 rounded-[1.9rem] bg-[radial-gradient(circle_at_50%_30%,#0a1a6b,#020523_70%)]">
                <Image src="/brand/wassla-app-icon-192.webp" alt="" width={96} height={96} unoptimized className="rounded-[22%]" />
                <p className="font-display text-lg font-semibold tracking-[0.1em]">WASSLA</p>
                <p className="px-6 text-center text-xs text-text-secondary">Pièces auto · Services · Algérie</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section kicker="Installation" title="En trois étapes">
        <ol className="grid gap-4 md:grid-cols-3">
          {[
            ["01", "Téléchargez", "Depuis Google Play (Android) ou l'App Store (iPhone)."],
            ["02", "Créez votre compte", "Client, vendeur, livreur ou prestataire : choisissez votre profil."],
            ["03", "Commandez ou vendez", "Recherchez une pièce, commandez et suivez votre livraison en direct."],
          ].map(([n, t, d]) => (
            <li key={n} className="rounded-xl border border-border p-5">
              <p className="font-mono text-xs text-accent">{n}</p>
              <h3 className="mt-2 font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-text-secondary">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8"><StoreBadges placement="download-steps" /></div>
      </Section>
    </>
  );
}
