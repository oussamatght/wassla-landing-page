import { fr } from "@/i18n/fr";

export interface NavItem {
  href: string;
  label: string;
  description?: string;
}

/** Footer list (unchanged contract). */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: fr.nav.home },
  { href: "/catalogue", label: fr.nav.parts },
  { href: "/categories/automobile", label: fr.nav.automobile },
  { href: "/categories/motos", label: fr.nav.moto },
  { href: "/categories/poids-lourds", label: fr.nav.heavy },
  { href: "/prestataires", label: fr.nav.providers },
  { href: "/boost", label: fr.nav.boost },
  { href: "/contact", label: fr.nav.contact },
];

/** Header "Catalogue" dropdown: the whole catalogue + the three sectors. */
export const CATALOGUE_LINKS: NavItem[] = [
  { href: "/catalogue", label: "Tout le catalogue", description: "Recherche par pièce, référence OEM ou VIN" },
  { href: "/categories/automobile", label: fr.nav.automobile, description: "Voitures et utilitaires légers" },
  { href: "/categories/motos", label: fr.nav.moto, description: "Motos, scooters et quads" },
  { href: "/categories/poids-lourds", label: fr.nav.heavy, description: "Camions, bus, remorques" },
];

/** Header links after the Catalogue dropdown (each appears once). */
export const HEADER_LINKS: NavItem[] = [
  { href: "/prestataires", label: fr.nav.providers },
  { href: "/vendre", label: "Vendre" },
  { href: "/boost", label: fr.nav.boost },
  { href: "/comment-ca-marche", label: "Comment ça marche" },
];

/** Extra links only in the mobile panel (desktop has them in the footer). */
export const MOBILE_EXTRA_LINKS: NavItem[] = [
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: fr.nav.contact },
];

const CATALOGUE_PREFIXES = ["/catalogue", "/categories", "/products"];

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

/** The Catalogue trigger is active on the catalogue, category and product pages. */
export function isCatalogueSection(pathname: string): boolean {
  return CATALOGUE_PREFIXES.some((p) => isActivePath(pathname, p));
}
