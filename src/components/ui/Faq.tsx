import { JsonLd } from "@/components/layout/PageHeader";

/** Native <details> accordion: keyboard and screen-reader friendly without JS. */
export function Faq({ items, withSchema = false }: { items: ReadonlyArray<{ q: string; a: string }>; withSchema?: boolean }) {
  return (
    <>
      {withSchema && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
          }}
        />
      )}
      <div className="divide-y divide-border rounded-xl border border-border">
        {items.map((item) => (
          <details key={item.q} className="group px-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium">
              {item.q}
              <span aria-hidden="true" className="font-mono text-accent transition-transform duration-(--duration-fast) group-open:rotate-45">+</span>
            </summary>
            <p className="pb-5 text-text-secondary">{item.a}</p>
          </details>
        ))}
      </div>
    </>
  );
}
