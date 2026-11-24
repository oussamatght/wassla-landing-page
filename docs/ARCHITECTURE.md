# Architecture

## Overview

This is a standalone Next.js app. It reads public data from the WASSLA backend API over HTTP and never touches a database directly. Site content is managed from the separate WASSLA administration tools.

```
browser ──► wassla-landing-page (Next.js, SSR/ISR + client islands)
               │  server: fetch WASSLA_API_URL (cached, zod-validated)
               │  client: fetch NEXT_PUBLIC_WASSLA_API_URL (TanStack Query)
               ▼
            WASSLA API /api/*  (public routes, incl. /api/public/landing/*)
```

## Folder layout

| Path | Purpose |
|---|---|
| `src/app/` | Routes (App Router), `layout.tsx`, `sitemap.ts`, `robots.ts`, the dev-only `/design` |
| `src/components/{layout,ui,hero,story3d,marketplace,providers,ads,boost,app-showcase}` | Presentational components. `ui/` is the design system. |
| `src/three/` | 3D scene, procedural models, materials, rigs, `timeline.config.ts`, `models.manifest.ts` |
| `src/features/<domain>/` | Domain logic that isn't a component (query hooks, URL-state helpers, analytics) |
| `src/services/api/` | Typed fetch client (`client.ts`), endpoint functions, zod schemas, adapters → `src/types/domain.ts` |
| `src/services/data-source.ts` | The single switch between real API and dev fixtures |
| `src/fixtures/` | Dev-only demonstration data (ESLint-restricted) |
| `src/i18n/fr.ts` | Every user-facing string (`ar.ts` later, same shape) |
| `src/lib/` | env (zod-validated), flags, constants (store URLs), format, labels, wilayas, Cloudinary loader |
| `src/styles/` | `tokens.css` (design tokens), `fonts.ts`, `fonts.arabic.ts` |
| `tests/{unit,integration,e2e}` | Vitest (unit + MSW integration), Playwright + axe (e2e) |
| `scripts/` | `sample-logo-colors.mjs`, `contrast-report.mjs`, `screenshot.mjs` |

**Note:** `src/styles/tokens.css` is imported by `src/app/globals.css`, because Tailwind v4 is configured CSS-first (`@theme inline`), so there is no `tailwind.config`.

## Rendering strategy

- **SEO pages** (home, catalogue first page, product, provider) are Server Components using `fetch` with `revalidate`. All filter state lives in the URL, so the first results page is server-rendered and shareable.
- **Interactive islands** are client components: header menu, filter drawer, combobox, gallery and boost form.
- **3D** is one fixed `<Canvas>`, loaded with `next/dynamic({ ssr: false })` after first paint and only when the `story3d` flag is on and the device tier allows it. The first viewport never waits for it.

## Data contracts

- Every backend response passes through `apiRequest(path, zodSchema)`. The envelope `{ success: true, data }` is checked, then the payload. Failures become a typed `ApiError` (`http | network | timeout | validation`).
- Adapters map backend shapes to view models (`ProductSummary`, `ProviderListingSummary`). Components never see raw backend documents.

## Feature flags

`story3d`, `boostSales`, `ads`, `editorial`, `providers`, `analytics` come from `NEXT_PUBLIC_FLAG_*`. The admin landing settings can switch a flag **off** but never on (`src/lib/flags.ts`). Features without backend support stay off.

## Security posture

- `poweredByHeader: false`.
- Security headers: `nosniff`, `DENY` framing, strict referrer, restrictive permissions policy.
- Images only from `res.cloudinary.com`.
- No secrets in the client.
- The site only consumes public endpoints, which return whitelisted fields.
