import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Section } from "@/components/layout/PageHeader";
import { dataSource } from "@/services/data-source";
import { formatPhoneDisplay as displayPhone } from "@/lib/format";
import { buttonClasses } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez l'équipe WASSLA.",
  alternates: { canonical: "/contact" },
};

/** Channels come from the admin landing settings; nothing is invented when unset. */
export default async function ContactPage() {
  const { data: settings } = await dataSource.settings();
  const c = settings?.contact ?? {};
  const hasChannel = Boolean(c.email || c.phone || c.whatsapp || c.address);
  return (
    <>
      <PageHeader kicker="Contact" title="Parlons-en" description="Une question sur une commande, un retour, la vente ou les prestataires ?" crumbs={[{ href: "/", label: "Accueil" }, { label: "Contact" }]} />
      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface-1 p-6">
            <h2 className="text-lg font-semibold">Une commande en cours ?</h2>
            <p className="mt-2 text-sm text-text-secondary">Le suivi, les litiges et les retours se gèrent depuis la commande dans l&apos;application WASSLA : c&apos;est le moyen le plus rapide d&apos;obtenir de l&apos;aide.</p>
            <Link href="/telecharger" className={buttonClasses("secondary", "md", "mt-4")}>Ouvrir l&apos;application</Link>
          </div>
          <div className="rounded-xl border border-border bg-surface-1 p-6">
            <h2 className="text-lg font-semibold">Nous joindre</h2>
            {hasChannel ? (
              <ul className="mt-3 space-y-2 text-sm">
                {c.email && <li>E-mail : <a href={`mailto:${c.email}`} className="text-accent underline underline-offset-4 hover:decoration-2">{c.email}</a></li>}
                {c.phone && <li>Téléphone : <a href={`tel:${c.phone}`} className="tabular text-accent underline underline-offset-4 hover:decoration-2">{displayPhone(c.phone)}</a></li>}
                {c.whatsapp && <li>WhatsApp : <a href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4 hover:decoration-2">{displayPhone(c.whatsapp)}</a></li>}
                {c.address && <li>Adresse : {c.address}</li>}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-text-secondary">Les coordonnées de l&apos;équipe seront bientôt affichées ici. En attendant, contactez-nous depuis l&apos;application (Profil → Aide et support).</p>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
