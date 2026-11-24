import Link from "next/link";

/** Active-filter chip; following the link removes that filter (works without JS). */
export function RemovableChipLink({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      aria-label={`Retirer le filtre ${label}`}
      className="inline-flex min-h-9 items-center gap-2 rounded-full border border-accent/50 bg-accent/10 ps-3.5 pe-2.5 text-sm font-medium text-text-primary hover:border-accent">
      {label}
      <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      </svg>
    </Link>
  );
}
