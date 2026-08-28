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

Data flow for a filtered page load: `searchParams` → `src/lib/filters.ts` (`RouteFilters` parse, pure) → `src/lib/route-query.ts` (`RouteFilters` → Prisma `where`/`orderBy`, pure) → `src/lib/routes.ts` (`server-only`, touches the database) → Server Component.

The database is touched only by `src/lib/routes.ts`, `src/lib/user-routes.ts`, `src/lib/users.ts` (all `server-only`), and the Auth.js Prisma adapter inside `src/auth.ts`. Everything else stays pure.

**Auth** (Auth.js / NextAuth v5, config in `src/auth.ts`): Credentials (email + password, `bcryptjs`) + Google. `session.strategy` is `jwt` — forced by the Credentials provider, so `Session`/`VerificationToken` tables exist but are unused, and `AUTH_SECRET` must be stable. `User`/`Account`/`Session` use `String @default(cuid())` PKs (Auth.js adapter contract), a deliberate break from this schema's `Int autoincrement` style; `UserRoute` keeps `Int`. Auth flow: form → `src/lib/actions/*` (`'use server'`, each re-checks the session — a Server Action is a public endpoint) → `src/lib/auth-validation.ts` / `src/lib/route-status.ts` (pure, unit-tested) → `src/lib/user-routes.ts` / `src/lib/users.ts` (`server-only`, DB — the latter holds the credentials-signup write for `registerAction`) → `src/lib/localize.ts` → component. `src/lib/auth-dal.ts` (`getCurrentUser`, cached; `requireUser`) is the authorization choke point — check auth there or in the page/action, **never** gate rendering in `layout.tsx` (it doesn't re-render on navigation). `src/proxy.ts` stays pure next-intl; `/api/auth/*` is outside its matcher so those endpoints aren't locale-prefixed. Registration is hand-rolled (`registerAction`) — NextAuth has no signup. NextAuth is pinned to an exact beta (`5.0.0-beta.32`); betas break between patches.

**Filters live in the URL** (`?difficulty=HARD&maxDays=20`), parsed server-side — every filtered view is a shareable link and there's no client state library for it. Keep the filter parse/query-build split pure and testable (see `src/__tests__/filters.test.ts`, `route-query.test.ts`) rather than folding query logic into components or route handlers.

**No `react-bootstrap`.** Bootstrap 5's stylesheet (`src/styles/globals.scss`) supplies reset/grid/utilities only; component styling is Sass Modules, one `Component.module.scss` beside each `Component.tsx`. This is what keeps most pages Server Components — only `FilterBar` and the compare selection (`CompareProvider`/`CompareBar`/`CompareToggle`) are client-side.

- `src/app/[locale]/page.tsx` — catalog: filters + card grid
- `src/app/[locale]/routes/[slug]/` — detail: stats, description, stage table
- `src/app/[locale]/compare/` — side-by-side table for up to 4 routes (state via `CompareProvider`)

`prisma.config.ts` + `src/lib/prisma.ts` provide a dev-HMR-safe `PrismaClient` singleton, driven by `@prisma/adapter-pg`. The generated client lives in `src/generated/prisma` (not `node_modules/@prisma/client`) per the `output` path in `prisma/schema.prisma` — import from there via the `@/` alias, not the default Prisma package location.

## Localization

Routes are locale-prefixed (`/en/...`, `/uk/...`, `localePrefix: 'always'`) via `next-intl`, with every page living under `src/app/[locale]/`; `src/proxy.ts` handles locale negotiation/redirects, and UI chrome strings live in `messages/en.json`/`messages/uk.json`. Translatable route/stage data (`name`, `summary`, `description`, `startPlace`, `endPlace`, `waymarking`, `bestSeason` on routes; `fromPlace`, `toPlace`, `notes` on stages) lives in `RouteTranslation`/`StageTranslation` tables keyed by `(routeId, locale)`/`(stageId, locale)`, resolved per-field to the current locale with English fallback via `src/lib/localize.ts`. `nameEs` is a permanent, always-shown native-name column on `Route` and is **not** part of this locale system; `countries` stays an untranslated facet key (translated only for display, via the `Countries` message namespace). Only two sample routes (`camino-frances`, `camino-portugues-central`) have full Ukrainian content today — the rest fall back to English by design.

The `20260826211238_add_translation_tables` migration is destructive: it drops the old flat text columns (`name`, `summary`, `description`, `startPlace`, `endPlace`, `waymarking`, `bestSeason` on `Route`; `fromPlace`, `toPlace`, `notes` on `Stage`) with no backfill into the new translation tables. As with any schema change to these models, `npx prisma migrate dev` must be followed by `npx prisma db seed` to repopulate content from `src/data/official-routes.ts`.

## Scope notes

No maps or accommodation data — see README "Not in this version" before adding either. `Stage` has no `lat`/`lng` yet; a future map feature would add nullable columns and a geocoding script, not a new data source.

User accounts exist (email+password + Google) with per-user PLANNED/COMPLETED route lists, but deliberately no email verification, password reset, or transactional email — there's no mail provider. The `20260828114521_add_auth_and_user_routes` migration is purely additive (new tables only), so it needs no re-seed.
