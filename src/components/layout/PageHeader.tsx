import Link from "next/link";
import type { ReactNode } from "react";

interface Crumb {
  href?: string;
  label: string;
}

interface PageHeaderProps {
  kicker?: string;
  title: string;
  description?: ReactNode;
  crumbs?: Crumb[];
  children?: ReactNode;
}

/** Shared page heading with breadcrumb (BreadcrumbList structured data is added by pages). */
export function PageHeader({ kicker, title, description, crumbs, children }: PageHeaderProps) {
  return (
    <header className="blueprint-grid border-b border-border">
      <div className="mx-auto max-w-7xl space-y-5 px-4 pt-10 pb-10 sm:px-6 lg:px-8">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Fil d'Ariane">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
              {crumbs.map((c, i) => (
                <li key={c.label} className="flex items-center gap-1.5">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  {c.href ? (
                    <Link href={c.href} className="hover:text-text-primary">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-text-secondary">
                      {c.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {kicker && <p className="font-mono text-xs tracking-[0.25em] text-accent uppercase">{kicker}</p>}
        <h1 className="max-w-3xl text-3xl leading-tight font-semibold sm:text-4xl lg:text-5xl">{title}</h1>
        {description && <div className="max-w-2xl text-lg text-text-secondary">{description}</div>}
        {children}
      </div>
    </header>
  );
}

export function Section({
  id,
  kicker,
  title,
  description,
  action,
  children,
  className = "",
}: {
  id?: string;
  kicker?: string;
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={title && id ? `${id}-titre` : undefined} className={`border-b border-border py-16 sm:py-20 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(title || kicker) && (
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl space-y-3">
              {kicker && <p className="font-mono text-xs tracking-[0.25em] text-accent uppercase">{kicker}</p>}
              {title && (
                <h2 id={id ? `${id}-titre` : undefined} className="text-2xl leading-tight font-semibold sm:text-3xl lg:text-4xl">
                  {title}
                </h2>
              )}
              {description && <div className="text-text-secondary">{description}</div>}
            </div>
            {action}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
