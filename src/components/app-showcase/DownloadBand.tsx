import Image from "next/image";
import Link from "next/link";
import { StoreBadges } from "@/components/app-showcase/StoreBadges";

/**
 * "Télécharger l'application" call to action, reused across pages. The app is
 * live; the links are the two official store URLs (src/lib/constants.ts).
 */
export function DownloadBand({ placement, title = "WASSLA est disponible dès aujourd'hui.", compact = false }: { placement: string; title?: string; compact?: boolean }) {
  return (
    <section aria-labelledby={`dl-${placement}`} className="border-b border-border">
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${compact ? "py-10" : "py-16"}`}>
        <div className="border-signature flex flex-col gap-6 rounded-2xl p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <Image src="/brand/wassla-app-icon-192.webp" alt="" width={72} height={72} unoptimized className="shrink-0 rounded-[22%]" />
            <div className="space-y-1.5">
              <h2 id={`dl-${placement}`} className="text-xl font-semibold sm:text-2xl">{title}</h2>
              <p className="text-sm text-text-secondary">
                Commandez, suivez la livraison en direct et gérez vos retours dans l&apos;application.{" "}
                <Link href="/telecharger" className="text-accent underline-offset-4 hover:underline">En savoir plus</Link>
              </p>
            </div>
          </div>
          <StoreBadges placement={placement} />
        </div>
      </div>
    </section>
  );
}
