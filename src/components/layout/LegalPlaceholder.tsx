import { PageHeader, Section } from "@/components/layout/PageHeader";

/**
 * Legal pages are placeholders until the validated texts are published.
 * They say so plainly instead of inventing legal content.
 */
export function LegalPlaceholder({ title, sections }: { title: string; sections: string[] }) {
  return (
    <>
      <PageHeader kicker="Informations légales" title={title} crumbs={[{ href: "/", label: "Accueil" }, { label: title }]} />
      <Section>
        <div className="max-w-3xl space-y-6">
          <p role="note" className="rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm">
            Contenu en cours de rédaction : le texte officiel sera publié par WASSLA. Cette page n&apos;a pas encore de valeur contractuelle.
          </p>
          <div>
            <h2 className="mb-3 text-lg font-semibold">Ce document couvrira notamment</h2>
            <ul className="list-disc space-y-1.5 ps-5 text-text-secondary">
              {sections.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
}
