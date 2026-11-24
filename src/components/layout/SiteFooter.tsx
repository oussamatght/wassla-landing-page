import Link from "next/link";
import { fr } from "@/i18n/fr";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { StoreBadges } from "@/components/app-showcase/StoreBadges";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-surface-1/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_auto] lg:px-8">
        <div className="space-y-4">
          <BrandLogo size={36} />
          <p className="max-w-sm text-sm text-text-secondary">{fr.meta.description}</p>
          <StoreBadges placement="footer" />
        </div>

        <nav aria-label={fr.a11y.footerNav}>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-1">
            {NAV_ITEMS.slice(1).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-text-secondary hover:text-text-primary">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="space-y-2 text-sm">
          {[
            ["/telecharger", "Télécharger l'application"],
            ["/comment-ca-marche", "Comment ça marche"],
            ["/vendre", "Vendre sur WASSLA"],
            ["/prestataires/publier", "Publier une prestation"],
            ["/espace-prestataire", "Espace prestataire"],
            ["/faq", "Questions fréquentes"],
          ].map(([href = "/", label]) => (
            <li key={href}>
              <Link href={href} className="text-text-secondary hover:text-text-primary">{label}</Link>
            </li>
          ))}
          <li className="pt-2">
            <Link href="/mentions-legales" className="text-text-secondary hover:text-text-primary">
              {fr.footer.legal}
            </Link>
          </li>
          <li>
            <Link href="/confidentialite" className="text-text-secondary hover:text-text-primary">
              {fr.footer.privacy}
            </Link>
          </li>
          <li>
            <Link href="/cgu" className="text-text-secondary hover:text-text-primary">
              {fr.footer.terms}
            </Link>
          </li>
        </ul>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-4 py-5 font-mono text-xs text-text-muted sm:px-6 lg:px-8">
          © {year} WASSLA. {fr.footer.rights}
        </p>
      </div>
    </footer>
  );
}
