"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface DialogBaseProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Native <dialog> + showModal(): the browser makes the rest of the page inert
 * (real focus containment), closes on Esc, and restores focus on close.
 */
function useNativeDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);
  return ref;
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Fermer"
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-text-secondary hover:bg-surface-3 hover:text-text-primary">
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export function Modal({ open, onClose, title, description, children, footer }: DialogBaseProps) {
  const ref = useNativeDialog(open, onClose);
  const titleId = useId();
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="m-auto w-[min(560px,calc(100vw-2rem))] rounded-xl border border-border-strong bg-surface-2 p-0 text-text-primary shadow-2xl backdrop:bg-(--scrim) backdrop:backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}>
      <div className="flex items-start justify-between gap-4 border-b border-border p-5">
        <div className="space-y-1">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          {description && <p className="text-sm text-text-secondary">{description}</p>}
        </div>
        <CloseButton onClose={onClose} />
      </div>
      <div className="max-h-[70dvh] overflow-y-auto p-5">{children}</div>
      {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-border p-4">{footer}</div>}
    </dialog>
  );
}

/** Bottom sheet on mobile, side panel from the inline-end edge on desktop. */
export function Drawer({ open, onClose, title, description, children, footer }: DialogBaseProps) {
  const ref = useNativeDialog(open, onClose);
  const titleId = useId();
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={cn(
        "m-0 mt-auto max-h-[88dvh] w-full max-w-none rounded-t-2xl border border-border-strong bg-surface-1 p-0 text-text-primary",
        "md:ms-auto md:mt-0 md:h-dvh md:max-h-none md:w-[420px] md:rounded-none md:rounded-s-2xl",
        "backdrop:bg-(--scrim) backdrop:backdrop-blur-sm",
      )}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}>
      <div className="flex h-full max-h-[inherit] flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            {description && <p className="text-sm text-text-secondary">{description}</p>}
          </div>
          <CloseButton onClose={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-border bg-surface-1 p-4">{footer}</div>}
      </div>
    </dialog>
  );
}
