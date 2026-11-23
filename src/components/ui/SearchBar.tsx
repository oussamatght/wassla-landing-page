import { useId } from "react";
import { fr } from "@/i18n/fr";
import { cn } from "@/lib/cn";

interface SearchBarProps {
  action?: string;
  name?: string;
  defaultValue?: string;
  label?: string;
  placeholder?: string;
  size?: "md" | "lg";
  /** Extra hidden fields to keep (e.g. current filters). */
  hidden?: Record<string, string>;
  className?: string;
}

/**
 * Plain GET form (works before hydration and without JS). Used by the hero
 * and the catalogue; VIN/OEM detection happens server-side on `q`.
 */
export function SearchBar({
  action = "/catalogue",
  name = "q",
  defaultValue,
  label = fr.hero.searchLabel,
  placeholder = fr.hero.searchPlaceholder,
  size = "lg",
  hidden,
  className,
}: SearchBarProps) {
  const id = useId();
  return (
    <form action={action} method="get" role="search" className={cn("w-full", className)}>
      {hidden &&
        Object.entries(hidden).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className={cn("border-signature flex items-center gap-2 rounded-full shadow-(--shadow-card)", size === "lg" ? "p-1.5" : "p-1")}>
        <svg aria-hidden="true" className="ms-3 shrink-0 text-text-muted" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.75" />
          <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
        <input
          id={id}
          name={name}
          type="search"
          inputMode="search"
          autoComplete="off"
          enterKeyHint="search"
          maxLength={120}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none",
            size === "lg" ? "min-h-11 text-base" : "min-h-10 text-sm",
          )}
        />
        <button
          type="submit"
          className={cn("bg-cta shrink-0 rounded-full font-semibold text-white", size === "lg" ? "min-h-11 px-5 text-sm" : "min-h-10 px-4 text-sm")}>
          <span className="max-[360px]:sr-only">{fr.hero.searchSubmit}</span>
          <svg aria-hidden="true" className="hidden max-[360px]:block" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
            <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </form>
  );
}
