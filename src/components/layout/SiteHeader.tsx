"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { fr } from "@/i18n/fr";
import { BrandLogo } from "@/components/layout/BrandLogo";
import {
  CATALOGUE_LINKS,
  HEADER_LINKS,
  MOBILE_EXTRA_LINKS,
  isActivePath,
  isCatalogueSection,
} from "@/components/layout/nav-items";

const linkBase =
  "relative inline-flex min-h-11 items-center gap-1 rounded-md px-3 text-sm font-medium transition-colors duration-(--duration-fast) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function ActiveBar() {
  return (
    <span
      aria-hidden="true"
      className="bg-signature absolute inset-x-3 bottom-1.5 h-px"
    />
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className={`transition-transform duration-(--duration-fast) ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Desktop "Catalogue" disclosure: click / Enter / Space / ArrowDown open it, Esc closes and returns focus. */
function CatalogueDropdown({ pathname }: { pathname: string }) {
  // Open state is tied to the route it was opened on: navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = useCallback(
    (v: boolean | ((prev: boolean) => boolean)) => {
      setOpenOn((prevOn) => {
        const next = typeof v === "function" ? v(prevOn === pathname) : v;
        return next ? pathname : null;
      });
    },
    [pathname],
  );
  const panelId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const focusFirstOnOpen = useRef(false);
  const active = isCatalogueSection(pathname);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  const links = () =>
    Array.from(
      wrapRef.current?.querySelectorAll<HTMLAnchorElement>("[data-dropdown-link]") ?? [],
    );

  // Keyboard opening (ArrowDown) moves focus to the first link once the panel is visible.
  useEffect(() => {
    if (!open || !focusFirstOnOpen.current) return;
    focusFirstOnOpen.current = false;
    wrapRef.current?.querySelector<HTMLAnchorElement>("[data-dropdown-link]")?.focus();
  }, [open]);
  const onPanelKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = links();
    const i = items.indexOf(document.activeElement as HTMLAnchorElement);
    const next =
      e.key === "ArrowDown"
        ? (i + 1) % items.length
        : (i - 1 + items.length) % items.length;
    items[next]?.focus();
  };
  // Hover opens on fine pointers only (touch uses the click); a short delay avoids flicker.
  function scheduleHover(e: React.PointerEvent, value: boolean) {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpen(value), value ? 60 : 160);
  }

  return (
    <div
      ref={wrapRef}
      className="relative"
      onPointerEnter={(e) => scheduleHover(e, true)}
      onPointerLeave={(e) => scheduleHover(e, false)}
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            if (open) links()[0]?.focus();
            else {
              focusFirstOnOpen.current = true;
              setOpen(true);
            }
          }
        }}
        className={`${linkBase} ${active || open ? "text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
      >
        Catalogue
        <Chevron open={open} />
        {active && <ActiveBar />}
      </button>
      <div
        id={panelId}
        onKeyDown={onPanelKey}
        className={`absolute top-full left-0 z-50 w-[22rem] pt-2 duration-(--duration-fast) motion-reduce:transition-none ${
          // Visibility flips instantly on open (focusable at once) and only fades out on close.
          open
            ? "visible translate-y-0 opacity-100 transition-[opacity,transform]"
            : "invisible -translate-y-1 opacity-0 transition-[opacity,transform,visibility]"
        }`}
      >
        <ul className="border-border bg-surface-1 rounded-xl border p-2 shadow-2xl">
          {CATALOGUE_LINKS.map((item) => {
            const current = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  data-dropdown-link
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`hover:bg-surface-2 focus-visible:bg-surface-2 flex flex-col rounded-lg px-3 py-2.5 transition-colors duration-(--duration-fast) focus-visible:outline-none ${current ? "bg-surface-2" : ""}`}
                >
                  <span
                    className={`text-sm font-semibold ${current ? "text-accent" : "text-text-primary"}`}
                  >
                    {item.label}
                  </span>
                  {item.description && (
                    <span className="text-text-secondary text-xs">
                      {item.description}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/**
 * Sticky header: transparent over the hero, solid once the page scrolls.
 * Desktop (≥ lg): Catalogue dropdown + primary links + download CTA.
 * Mobile: compact bar; the menu is a modal panel (focus trap, Esc, closes on navigation).
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // Tied to the route it was opened on: any navigation (link, back/forward) closes it.
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null);
  const menuOpen = menuOpenOn === pathname;
  const setMenuOpen = useCallback(
    (v: boolean) => setMenuOpenOn(v ? pathname : null),
    [pathname],
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Leaving the mobile breakpoint closes the panel (no stuck scroll lock).
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setMenuOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [setMenuOpen]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    toggleRef.current?.focus();
  }, [setMenuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const panel = menuRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? [],
      );
    focusables()[0]?.focus();
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== "Tab") return;
      const items = [toggleRef.current, ...focusables()].filter(Boolean) as HTMLElement[];
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen, closeMenu]);

  const solid = scrolled || menuOpen;

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-(--duration-base) ${
          solid
            ? "border-border bg-bg/90 border-b backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <BrandLogo />

          <nav aria-label={fr.a11y.mainNav} className="hidden lg:block">
            <ul className="flex items-center gap-0.5 xl:gap-1">
              <li>
                <CatalogueDropdown pathname={pathname} />
              </li>
              {HEADER_LINKS.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`${linkBase} ${active ? "text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
                    >
                      {item.label}
                      {active && <ActiveBar />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/telecharger"
              aria-current={isActivePath(pathname, "/telecharger") ? "page" : undefined}
              className="bg-cta focus-visible:outline-accent hidden min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-white shadow-[0_0_0_1px_rgb(255_255_255/0.08)_inset] transition-[filter] duration-(--duration-fast) hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 sm:inline-flex"
            >
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {fr.nav.downloadApp}
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className="text-text-primary hover:bg-surface-2 focus-visible:outline-accent inline-flex h-11 w-11 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
              aria-label={menuOpen ? fr.a11y.closeMenu : fr.a11y.openMenu}
              onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
            >
              <svg
                aria-hidden="true"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
              >
                {menuOpen ? (
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M4 7h16M4 12h16M4 17h10"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Sibling of <header>: the header's backdrop-filter would otherwise become the
          containing block of this fixed panel and collapse it to the header's height. */}
      <div
        ref={menuRef}
        id="menu-mobile"
        role="dialog"
        aria-modal="true"
        aria-label={fr.a11y.mainNav}
        aria-hidden={!menuOpen}
        className={`border-border bg-bg fixed inset-x-0 top-16 bottom-0 z-50 overflow-y-auto overscroll-contain border-t px-4 pt-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] duration-(--duration-base) motion-reduce:transition-none lg:hidden ${
          menuOpen
            ? "visible translate-y-0 opacity-100 transition-[opacity,transform]"
            : "invisible -translate-y-2 opacity-0 transition-[opacity,transform,visibility]"
        }`}
      >
        <nav aria-label="Menu mobile" className="mx-auto max-w-lg">
          <p className="text-text-muted mb-2 font-mono text-xs tracking-[0.2em] uppercase">
            Catalogue
          </p>
          <ul className="grid grid-cols-2 gap-2">
            {CATALOGUE_LINKS.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-14 flex-col justify-center rounded-lg border px-3 py-2 ${active ? "border-accent/60 bg-surface-2" : "border-border bg-surface-1"}`}
                  >
                    <span
                      className={`text-sm font-semibold ${active ? "text-accent" : "text-text-primary"}`}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <ul className="mt-6 flex flex-col">
            {[...HEADER_LINKS, ...MOBILE_EXTRA_LINKS].map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href} className="border-border border-b">
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-14 items-center justify-between text-lg font-medium ${active ? "text-accent" : "text-text-primary"}`}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className="text-text-muted font-mono text-xs"
                    >
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/telecharger"
            onClick={() => setMenuOpen(false)}
            className="bg-cta mt-8 flex min-h-12 items-center justify-center rounded-full text-base font-semibold text-white"
          >
            {fr.nav.downloadApp}
          </Link>
        </nav>
      </div>
    </>
  );
}
