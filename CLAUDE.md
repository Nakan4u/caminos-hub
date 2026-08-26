# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
nvm use                    # Node 22, per .nvmrc — Prisma 7 CLI requires Node 20.19+
npm install
npm run dev                # dev server, localhost:3000

npm run db:up               # first-time: create + start Postgres 16 container (docker)
npm run db:start            # subsequent: start existing container
npx prisma migrate dev      # apply schema
npx prisma db seed          # load the 15 routes / 191 stages from src/data/official-routes.ts

npm test                    # vitest run — all 80 tests, no database needed
npm run test:watch
npx vitest run src/__tests__/seed-data.test.ts   # single file
npm run lint
npm run type-check          # tsc --noEmit
npm run db:studio           # Prisma Studio GUI
```

`npm run build`/`start` for production. `npm run generate` regenerates the Prisma client into `src/generated/prisma` after a schema change (also runs automatically on `prisma migrate dev`).

## Architecture

**`src/data/official-routes.ts` is the single source of truth** for route/stage data — a typed, hand-authored TS file, not the database. `prisma/seed.ts` loads it into Postgres; the Vitest suite (`seed-data.test.ts`) validates it directly against this file with no database involved (unique slugs, stages chaining end-to-end, stage distances summing within 5% of the stated total, geocodable place names).

Data flow for a filtered page load: `searchParams` → `src/lib/filters.ts` (`RouteFilters` parse, pure) → `src/lib/route-query.ts` (`RouteFilters` → Prisma `where`/`orderBy`, pure) → `src/lib/routes.ts` (the only module that touches the database, marked `server-only`) → Server Component.

**Filters live in the URL** (`?difficulty=HARD&maxDays=20`), parsed server-side — every filtered view is a shareable link and there's no client state library for it. Keep the filter parse/query-build split pure and testable (see `src/__tests__/filters.test.ts`, `route-query.test.ts`) rather than folding query logic into components or route handlers.

**No `react-bootstrap`.** Bootstrap 5's stylesheet (`src/styles/globals.scss`) supplies reset/grid/utilities only; component styling is Sass Modules, one `Component.module.scss` beside each `Component.tsx`. This is what keeps most pages Server Components — only `FilterBar` and the compare selection (`CompareProvider`/`CompareBar`/`CompareToggle`) are client-side.

- `src/app/page.tsx` — catalog: filters + card grid
- `src/app/routes/[slug]/` — detail: stats, description, stage table
- `src/app/compare/` — side-by-side table for up to 4 routes (state via `CompareProvider`)

`prisma.config.ts` + `src/lib/prisma.ts` provide a dev-HMR-safe `PrismaClient` singleton, driven by `@prisma/adapter-pg`. The generated client lives in `src/generated/prisma` (not `node_modules/@prisma/client`) per the `output` path in `prisma/schema.prisma` — import from there via the `@/` alias, not the default Prisma package location.

## Scope notes

No maps, accommodation data, user accounts, or i18n (English only) — see README "Not in this version" before adding any of these. `Stage` has no `lat`/`lng` yet; a future map feature would add nullable columns and a geocoding script, not a new data source.
