"use client";

import { useState, type ReactNode } from "react";
import { Drawer } from "@/components/ui/Dialog";

/**
 * Mobile filter drawer. The filter form itself is server-rendered and passed
 * as children, so the same GET form works in the sidebar and here (and
 * without JavaScript, the sidebar version is used).
 */
export function FiltersDrawer({ count, children, title = "Filtres" }: { count: number; children: ReactNode; title?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border-strong px-4 text-sm font-semibold lg:hidden"
        aria-haspopup="dialog">
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
        {title}
        {count > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-on-accent">
            {count}
          </span>
        )}
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} title={title}>
        {children}
      </Drawer>
    </>
  );
}
