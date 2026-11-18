/**
 * Official store listings. These are the ONLY store URLs allowed anywhere
 * in the site.
 */
export const STORE_LINKS = {
  googlePlay: "https://play.google.com/store/apps/details?id=com.wassla.dz.app",
  appStore: "https://apps.apple.com/us/app/wassla-app/id6782409544",
} as const;

export type StoreId = keyof typeof STORE_LINKS;

export const SITE_NAME = "WASSLA";

/**
 * Page size used for catalogue requests. `/products/search` caps `limit` at
 * 100; `/products` applies no cap, so the site always sends this.
 */
export const PAGE_SIZE = 24;
