import Link from "next/link";
import { cn } from "@/lib/cn";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Builds the href for a page (keeps every other URL filter). */
  hrefForPage: (page: number) => string;
}

function pageList(page: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (page >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", page - 1, page, page + 1, "…", total];
}

const cell =
  "inline-flex h-11 min-w-11 items-center justify-center rounded-md border px-3 text-sm font-medium tabular transition-colors";

/** Link-based pagination: works without JS, crawlable, back-button safe. */
export function Pagination({ page, totalPages, hrefForPage }: PaginationProps) {
  if (totalPages <= 1) return null;
  const prev = page > 1 ? hrefForPage(page - 1) : null;
  const next = page < totalPages ? hrefForPage(page + 1) : null;
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1.5">
      {prev ? (
        <Link href={prev} rel="prev" className={cn(cell, "border-border hover:border-border-strong")} aria-label="Page précédente">
          ←
        </Link>
      ) : (
        <span className={cn(cell, "border-border opacity-40")} aria-hidden="true">
          ←
        </span>
      )}
      {pageList(page, totalPages).map((item, index) =>
        item === "…" ? (
          <span key={`gap-${index}`} className="px-1 text-text-muted" aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefForPage(item)}
            aria-label={`Page ${item}`}
            aria-current={item === page ? "page" : undefined}
            className={cn(
              cell,
              item === page ? "border-accent bg-accent/10 text-text-primary" : "border-border text-text-secondary hover:border-border-strong",
            )}>
            {item}
          </Link>
        ),
      )}
      {next ? (
        <Link href={next} rel="next" className={cn(cell, "border-border hover:border-border-strong")} aria-label="Page suivante">
          →
        </Link>
      ) : (
        <span className={cn(cell, "border-border opacity-40")} aria-hidden="true">
          →
        </span>
      )}
    </nav>
  );
}
