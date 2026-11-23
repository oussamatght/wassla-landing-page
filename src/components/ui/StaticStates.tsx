import type { ReactNode } from "react";
import { fr } from "@/i18n/fr";
import { cn } from "@/lib/cn";

/*
 * Server-safe, non-interactive states (no "use client"): importing them from a
 * server component never creates a client island. Interactive ErrorState stays
 * in States.tsx.
 */

/** Brand line illustration: a caliper/disc outline drawn as a blueprint. */
export function BlueprintIllustration({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 160 120" fill="none" className={cn("h-28 w-36 text-accent", className)}>
      <defs>
        <linearGradient id="bp-stroke" x1="0" y1="0" x2="160" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-cyan-400)" />
          <stop offset="0.55" stopColor="var(--brand-blue-500)" />
          <stop offset="1" stopColor="var(--brand-violet-500)" />
        </linearGradient>
      </defs>
      <path d="M8 100h144M8 20h144" stroke="currentColor" strokeOpacity="0.15" strokeDasharray="2 4" />
      <circle cx="70" cy="60" r="38" stroke="url(#bp-stroke)" strokeWidth="1.5" />
      <circle cx="70" cy="60" r="14" stroke="currentColor" strokeOpacity="0.5" />
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i * Math.PI) / 3;
        return <circle key={i} cx={70 + Math.cos(a) * 24} cy={60 + Math.sin(a) * 24} r="2.5" stroke="currentColor" strokeOpacity="0.5" />;
      })}
      <path d="M100 34c18 6 26 16 26 26s-8 20-26 26" stroke="url(#bp-stroke)" strokeWidth="6" strokeLinecap="round" strokeOpacity="0.9" />
      <path d="M132 60h20M70 8v12M70 100v12" stroke="currentColor" strokeOpacity="0.35" />
      <text x="134" y="54" fill="currentColor" fillOpacity="0.5" fontSize="7" fontFamily="var(--font-mono)">Ø276</text>
    </svg>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center gap-4 rounded-lg border border-dashed border-border-strong px-6 py-14 text-center", className)}>
      <BlueprintIllustration />
      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="mx-auto max-w-md text-sm text-text-secondary">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-surface-3/70", className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface-1">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-11/12" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 8, label = fr.a11y.loading }: { count?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
