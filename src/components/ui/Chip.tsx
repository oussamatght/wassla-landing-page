import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const chipBase =
  "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors duration-(--duration-fast)";

/** Static, non-interactive label (e.g. "Moto", "À domicile"). */
export function Chip({ className, ...props }: ComponentProps<"span">) {
  return <span className={cn(chipBase, "border-border text-text-secondary", className)} {...props} />;
}

interface FilterChipProps extends Omit<ComponentProps<"button">, "type"> {
  selected: boolean;
}

/** Toggle filter (aria-pressed). Removable variant shows a × for active filters. */
export function FilterChip({ selected, className, children, ...props }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        chipBase,
        selected
          ? "border-accent/70 bg-accent/10 text-text-primary"
          : "border-border text-text-secondary hover:border-border-strong hover:text-text-primary",
        className,
      )}
      {...props}>
      {selected && (
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  );
}

interface RemovableChipProps {
  label: string;
  onRemove: () => void;
}

export function RemovableChip({ label, onRemove }: RemovableChipProps) {
  return (
    <span className={cn(chipBase, "border-accent/50 bg-accent/10 pe-1 text-text-primary")}>
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Retirer le filtre ${label}`}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-text-secondary hover:bg-surface-3 hover:text-text-primary">
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}
