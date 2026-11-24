import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center gap-5 px-4 py-20 sm:px-6">
      <p className="font-mono text-xs tracking-[0.25em] text-accent">ERREUR 404</p>
      <h1 className="text-3xl font-semibold sm:text-4xl">Cette page n&apos;existe pas (ou plus).</h1>
      <p className="text-text-secondary">
        L&apos;annonce a peut-être été retirée par son vendeur, ou le lien est incorrect.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="bg-cta inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold text-white">
          Retour à l&apos;accueil
        </Link>
        <Link
          href="/catalogue"
          className="inline-flex min-h-11 items-center rounded-full border border-border-strong px-5 text-sm font-semibold">
          Parcourir les pièces
        </Link>
      </div>
    </section>
  );
}
