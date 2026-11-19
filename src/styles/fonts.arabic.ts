import { IBM_Plex_Sans_Arabic } from "next/font/google";

/**
 * Prepared for the Arabic (RTL) release — intentionally NOT imported anywhere
 * yet, so it adds nothing to the current payload. To activate: import it in
 * src/app/layout.tsx, add `fontArabic.variable` to <html>, and map
 * `--font-body` to `var(--font-arabic)` under `[dir="rtl"]` in globals.css.
 */
export const fontArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});
