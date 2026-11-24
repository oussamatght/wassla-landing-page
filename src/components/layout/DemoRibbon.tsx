import { fr } from "@/i18n/fr";

/**
 * Rule 8: every page rendered while fixtures are enabled shows this ribbon.
 * It is mounted by the root layout whenever NEXT_PUBLIC_USE_FIXTURES=true.
 */
export function DemoRibbon() {
  return (
    <div
      role="status"
      className="sticky top-0 z-[90] bg-warning px-4 py-1.5 text-center font-mono text-xs font-medium tracking-[0.2em] text-navy-950">
      {fr.badges.demo} — aucune de ces annonces n&apos;est réelle
    </div>
  );
}
