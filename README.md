# WASSLA — landing page & public marketplace

The public website of **WASSLA**, an Algerian marketplace for automotive, motorcycle and heavy-vehicle parts and services.

The site combines a scroll-driven 3D brand story with a public parts catalogue, a service-provider directory, Boost packs for sellers, and links to the mobile app. All marketplace data comes from the WASSLA API at runtime.

## Features

- **Scroll story:** a procedural Three.js scene (brake, motorcycle drivetrain, turbocharger) with device tiers, static fallbacks and full `prefers-reduced-motion` support.
- **Catalogue:** search, filters kept in the URL, server-rendered first page, product pages.
- **Service providers:** directory, listing pages, listing creation and visitor reports.
- **Boost:** promotion packs for sellers.
- **Content pages:** how it works, FAQ, contact, app download, legal pages.
- **SEO:** sitemap, robots, Open Graph metadata.
- **Accessibility:** WCAG AA colour tokens checked by a script, plus axe checks in end-to-end tests.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · TanStack Query · zod · Three.js / React Three Fiber / drei · GSAP · Vitest · Playwright · MSW

## Getting started

Requirements: Node.js ≥ 22.12 and npm.

```bash
npm ci
cp .env.example .env.local   # placeholders only; adjust to your setup
npm run dev                  # http://localhost:3000
```

The site needs a WASSLA API instance to show real data. Point `WASSLA_API_URL` and `NEXT_PUBLIC_WASSLA_API_URL` at a **local or development** instance. Without a reachable API, data pages show an "unavailable" state; in development they also show a short diagnostic.

**Demo mode (development only):**

```bash
npm run dev:fixtures
```

This loads demonstration data and shows a "DONNÉES DE DÉMONSTRATION" ribbon on every page. Production builds refuse to start in this mode.

## Configuration

All settings are environment variables; see [`.env.example`](.env.example).

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (sitemap, Open Graph) |
| `WASSLA_API_URL` / `NEXT_PUBLIC_WASSLA_API_URL` | API base URL including `/api` (server / browser) |
| `NEXT_PUBLIC_USE_FIXTURES` | Demo data, development only |
| `NEXT_PUBLIC_FLAG_*` | Feature flags (3D story, Boost, ads, editorial, providers, analytics) |
| `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` | Optional browser key for provider maps |

Never commit `.env.local` or real keys. `NEXT_PUBLIC_*` values are inlined at build time and are visible to every visitor.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Develop, build and serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end and accessibility tests (Playwright + axe) |
| `npm run format` / `format:check` | Prettier |
| `npm run contrast` | WCAG AA check of every colour-token pair |
| `npm run sample-logo` | Re-sample brand colours from the logo |

## Project structure

```
src/
  app/          routes (App Router), sitemap, robots
  components/   UI and page sections (ui/ is the design system)
  features/     domain logic: query hooks, URL state, analytics
  services/     typed API client, zod schemas, adapters
  three/        3D scene, procedural models, scroll timeline
  lib/          env, flags, constants, formatting
  styles/       design tokens and fonts
tests/          unit (Vitest) and e2e (Playwright)
scripts/        screenshots, 3D measurements, contrast report
docs/           architecture, design system, 3D pipeline
```

Further reading: [Architecture](docs/ARCHITECTURE.md) · [Design system](docs/DESIGN_SYSTEM.md) · [3D pipeline](docs/3D_PIPELINE.md)

## Security

Please do not open public issues for security problems. See [SECURITY.md](SECURITY.md).

## License

Copyright © WASSLA. All rights reserved. The source is visible for reference only. The WASSLA name and logo are not licensed for reuse. See [LICENSE](LICENSE).
