"use client";

import { fr } from "@/i18n/fr";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import type { ReactNode } from "react";

// Non-interactive states live in StaticStates.tsx (server-safe); re-exported for client callers.
export { BlueprintIllustration, EmptyState, Skeleton, ProductCardSkeleton, GridSkeleton } from "@/components/ui/StaticStates";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retrying?: boolean;
  /** Server-rendered retry (e.g. a link to the same URL) when no callback is possible. */
  action?: ReactNode;
  /** Optional extra block (dev diagnostics). */
  children?: ReactNode;
  className?: string;
}

export function ErrorState({
  title = fr.states.errorTitle,
  description = fr.states.errorDescription,
  onRetry,
  retrying,
  action,
  children,
  className,
}: ErrorStateProps) {
  return (
    <div role="alert" className={cn("flex flex-col items-center gap-4 rounded-lg border border-danger/30 bg-danger/5 px-6 py-12 text-center", className)}>
      <svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-danger">
        <path d="M12 3l9.5 17h-19L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 10v4.5M12 17.2v.3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mx-auto max-w-md text-sm text-text-secondary">{description}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} loading={retrying} loadingLabel="Nouvel essai…">
          {fr.states.retry}
        </Button>
      )}
      {action}
      {children}
    </div>
  );
}

