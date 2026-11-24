# WASSLA design system

Live gallery: `/design` (dev server only; returns 404 in production builds).

## Logo

- `public/brand/wassla-logo.png`: 1254×1254, RGB, with the navy background baked in.
- `public/brand/wassla-app-icon.png`: the same artwork as a rounded app icon. The header and footer use it as a tile next to the text "WASSLA".
- **Never** stretch, recolour, redraw or crop the logo.
- The WASSLA name and logo are trademarks and are not licensed for reuse (see `LICENSE`).

**Planned assets:**
1. W mark alone, transparent SVG/PNG.
2. Horizontal wordmark, SVG.
3. Official "Disponible sur Google Play" / "Télécharger dans l'App Store" badge files from Google and Apple brand resources.
4. Real app screenshots (at least 3, portrait).
5. Product and provider photography, if any is to be used outside the API.

## Colour

Sampled from the logo with `npm run sample-logo` (`scripts/sample-logo-colors.mjs`):

| Token | Initial | Sampled | Final |
|---|---|---|---|
| navy-950 | `#030A32` | background corner `#010322` | `#020523` |
| navy-900 | `#050D43` | background field `#02125B` | `#04104C` |
| cyan-400 | `#16D9EF` | W left stroke `#30EEFD` | `#30EEFD` |
| blue-500 | `#145DFF` | strokes `#0741EF` … `#1895FD` | `#145DFF` |
| violet-500 | `#7135FA` | right loop `#5023FD` | `#5B2CFD` |
| lavender-300 | `#D18CFF` | right tip `#D57EFD` / `#DE81FF` | `#D97FFE` |
| white | `#F7F8FF` | wordmark `#FEFDFE` | `#F7F8FF` (text) |

Semantic tokens live in `src/styles/tokens.css` and are exposed to Tailwind in `src/app/globals.css` (`bg-surface-1`, `text-text-secondary`, `border-border-strong`, `text-sponsored`, …). The site is **dark only** by design ("night garage"), so there is no light theme.

### Signature gradient: usage rule

- `--signature-gradient` (cyan → blue → violet) is **decorative only**: 1px highlight borders (`.border-signature`), active nav underline, 3D rim lights, illustrations. It never fills a page background and never carries text. White on its cyan end is **1.42:1**.
- `--cta-gradient` (`#0B6BD6 → #145DFF → #5B2CFD`) is the same direction, deepened for **primary buttons** (`.bg-cta`). White labels measure **5.14 / 5.20 / 6.51:1** on its three stops, and a cyan inner highlight keeps the brand rim.

### WCAG AA contrast (`npm run contrast`, exits non-zero on failure)

| Foreground | Background | Ratio | Required | Result | Usage |
|---|---|---|---|---|---|
| text-primary `#f7f8ff` | bg `#020523` | 18.91:1 | 4.5:1 | PASS | body text |
| text-secondary `#b9c0e3` | bg `#020523` | 11.17:1 | 4.5:1 | PASS | secondary text |
| text-muted `#939cc8` | bg `#020523` | 7.47:1 | 4.5:1 | PASS | captions, meta |
| accent `#30eefd` | bg `#020523` | 14.09:1 | 4.5:1 | PASS | links, active labels |
| success `#34d399` | bg `#020523` | 10.42:1 | 4.5:1 | PASS | status text |
| warning `#fbbf24` | bg `#020523` | 12.00:1 | 4.5:1 | PASS | status text |
| danger `#fb7185` | bg `#020523` | 7.44:1 | 4.5:1 | PASS | errors |
| sponsored `#d97ffe` | bg `#020523` | 8.03:1 | 4.5:1 | PASS | Sponsorisé badge text |
| text-primary `#f7f8ff` | surface-1 `#071034` | 17.50:1 | 4.5:1 | PASS | body text |
| text-secondary `#b9c0e3` | surface-1 `#071034` | 10.34:1 | 4.5:1 | PASS | secondary text |
| text-muted `#939cc8` | surface-1 `#071034` | 6.91:1 | 4.5:1 | PASS | captions, meta |
| accent `#30eefd` | surface-1 `#071034` | 13.04:1 | 4.5:1 | PASS | links, active labels |
| success `#34d399` | surface-1 `#071034` | 9.64:1 | 4.5:1 | PASS | status text |
| warning `#fbbf24` | surface-1 `#071034` | 11.11:1 | 4.5:1 | PASS | status text |
| danger `#fb7185` | surface-1 `#071034` | 6.89:1 | 4.5:1 | PASS | errors |
| sponsored `#d97ffe` | surface-1 `#071034` | 7.43:1 | 4.5:1 | PASS | Sponsorisé badge text |
| text-primary `#f7f8ff` | surface-2 `#0b1643` | 16.38:1 | 4.5:1 | PASS | body text |
| text-secondary `#b9c0e3` | surface-2 `#0b1643` | 9.68:1 | 4.5:1 | PASS | secondary text |
| text-muted `#939cc8` | surface-2 `#0b1643` | 6.47:1 | 4.5:1 | PASS | captions, meta |
| accent `#30eefd` | surface-2 `#0b1643` | 12.21:1 | 4.5:1 | PASS | links, active labels |
| success `#34d399` | surface-2 `#0b1643` | 9.03:1 | 4.5:1 | PASS | status text |
| warning `#fbbf24` | surface-2 `#0b1643` | 10.40:1 | 4.5:1 | PASS | status text |
| danger `#fb7185` | surface-2 `#0b1643` | 6.45:1 | 4.5:1 | PASS | errors |
| sponsored `#d97ffe` | surface-2 `#0b1643` | 6.96:1 | 4.5:1 | PASS | Sponsorisé badge text |
| text-primary `#f7f8ff` | surface-3 `#111f57` | 14.61:1 | 4.5:1 | PASS | body text |
| text-secondary `#b9c0e3` | surface-3 `#111f57` | 8.63:1 | 4.5:1 | PASS | secondary text |
| text-muted `#939cc8` | surface-3 `#111f57` | 5.77:1 | 4.5:1 | PASS | captions, meta |
| accent `#30eefd` | surface-3 `#111f57` | 10.88:1 | 4.5:1 | PASS | links, active labels |
| success `#34d399` | surface-3 `#111f57` | 8.05:1 | 4.5:1 | PASS | status text |
| warning `#fbbf24` | surface-3 `#111f57` | 9.27:1 | 4.5:1 | PASS | status text |
| danger `#fb7185` | surface-3 `#111f57` | 5.75:1 | 4.5:1 | PASS | errors |
| sponsored `#d97ffe` | surface-3 `#111f57` | 6.20:1 | 4.5:1 | PASS | Sponsorisé badge text |
| on-accent `#020523` | accent `#30eefd` | 14.09:1 | 4.5:1 | PASS | text on cyan fill |
| white `#ffffff` | cta-start `#0b6bd6` | 5.14:1 | 4.5:1 | PASS | CTA label (gradient start) |
| white `#ffffff` | cta-mid `#145dff` | 5.20:1 | 4.5:1 | PASS | CTA label (gradient middle) |
| white `#ffffff` | cta-end `#5b2cfd` | 6.51:1 | 4.5:1 | PASS | CTA label (gradient end) |
| navy-950 `#020523` | warning `#fbbf24` | 12.00:1 | 4.5:1 | PASS | demo ribbon |
| accent `#30eefd` | bg `#020523` | 14.09:1 | 3:1 | PASS | focus ring (non-text, 1.4.11) |

38/38 pairs pass WCAG AA.

## Typography

All fonts are self-hosted via `next/font` (`src/styles/fonts.ts`):

- **Display — Sora 500/600/700.** Geometric with squared, technical terminals. It reads as "engineered" at large sizes without Space Grotesk's novelty or Unbounded's width, and has full Latin Extended (French diacritics).
- **Body/UI — Inter.** Legible at small sizes, with tabular figures (`.tabular`) for prices.
- **Mono — IBM Plex Mono 400/500.** Part references, codes and technical labels.
- **Arabic, prepared but not loaded:** IBM Plex Sans Arabic in `src/styles/fonts.arabic.ts`. It isn't imported anywhere, so it costs nothing until the RTL release. Layouts already use logical properties (`ms-`, `me-`, `start-`, `end-`, `ps-`, `pe-`).
- **Prices:** `formatPriceDA()` (`src/lib/format.ts`) renders `12 500 DA` with narrow no-break spaces (U+202F) and whole-dinar rounding, matching backend rounding.

## Art direction

"Night garage / precision engineering":
- dark studio surfaces and a faint blueprint grid (`.blueprint-grid`);
- mono technical labels;
- a line-art caliper illustration (`BlueprintIllustration`) for empty and no-photo states;
- cyan/violet rims reserved for highlights.

**Avoid:** glassmorphism everywhere, emoji icons, stock photos.

## Components (`src/components`)

| Component | File | Notes |
|---|---|---|
| Button / ButtonLink | `ui/Button.tsx` | primary (CTA gradient), secondary, ghost; `loading` with spinner and `aria-busy`; min height 44px |
| Input / Select / FieldShell | `ui/Field.tsx` | label `htmlFor`, hint and error via `aria-describedby`, errors `role="alert"`, `aria-invalid` |
| Combobox | `ui/Combobox.tsx` | ARIA 1.2 editable combobox (list autocomplete, ↑↓ Enter Esc), accent-insensitive filter |
| SearchBar | `ui/SearchBar.tsx` | plain GET form to `/catalogue?q=`; works without JS |
| Chip / FilterChip / RemovableChip | `ui/Chip.tsx` | `aria-pressed` toggles; removable chips have a labelled × |
| Badge / SponsoredBadge / AdBadge | `ui/Badge.tsx` | **Sponsorisé** (lavender, star glyph) and **Publicité** are distinct |
| ProductCard | `marketplace/ProductCard.tsx` | one link per card, Cloudinary image or blueprint placeholder, Sponsorisé only when the backend says so |
| ProviderCard | `providers/ProviderCard.tsx` | no ratings, "vérifié" badge or availability (not stored); "Mis en avant" only while promoted |
| Skeleton / ProductCardSkeleton / GridSkeleton | `ui/States.tsx` | `role="status"` on the grid |
| EmptyState / ErrorState | `ui/States.tsx` | illustration + action; error has `role="alert"` and a retry button |
| Pagination | `ui/Pagination.tsx` | links (crawlable, works without JS), `aria-current="page"`, `rel=prev/next` |
| Modal / Drawer | `ui/Dialog.tsx` | native `<dialog>` + `showModal()`: inert background, Esc, focus restore, unique title ids; the drawer is a bottom sheet on mobile and a side panel on desktop |
| Toast | `ui/Toast.tsx` | polite live region; errors `role="alert"`; never the only copy of information |
| StoreBadges | `app-showcase/StoreBadges.tsx` | official store URLs only, `target=_blank rel="noopener noreferrer"`, analytics event, App Store first on Apple devices; text buttons until official artwork is supplied |

## Motion tokens

| Token | Value | GSAP equivalent |
|---|---|---|
| `--duration-fast` | 150 ms | hovers, toggles |
| `--duration-base` | 250 ms | header, cards |
| `--duration-slow` | 400 ms | image zoom |
| `--duration-scene` | 800 ms | section reveals |
| `--ease-ui` | `cubic-bezier(.215,.61,.355,1)` | `power3.out` |
| `--ease-camera` | `cubic-bezier(.455,.03,.515,.955)` | `power2.inOut` |

- Hover lift is at most 4px, and only under `motion-safe`.
- `prefers-reduced-motion: reduce` zeroes CSS animation and transition durations globally (`globals.css`) and sets `--hover-lift: 0`.
