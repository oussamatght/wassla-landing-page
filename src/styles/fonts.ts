import { IBM_Plex_Mono, Inter, Sora } from "next/font/google";

/**
 * Self-hosted at build time by next/font (no runtime request to Google).
 * - Display: Sora — geometric with technical, slightly squared terminals; it
 *   reads as "engineered" at large sizes without the novelty of Space Grotesk
 *   or the width of Unbounded, and carries full French diacritics.
 * - Body/UI: Inter — high legibility at small sizes, tabular figures for prices.
 * - Mono: IBM Plex Mono — part references and technical labels; pairs with
 *   IBM Plex Sans Arabic (prepared in fonts.arabic.ts for the RTL release).
 *
 * Performance: `subsets` only selects what is PRELOADED. latin-ext stays declared
 * (unicode-range) and is fetched only if a page uses those glyphs. The mono face
 * (small labels) is not preloaded at all.
 */
export const fontDisplay = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});
