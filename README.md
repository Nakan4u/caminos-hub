# Camino-Hub

Browse, filter and compare the **official routes of the Camino de Santiago**.

Fifteen recognised routes, each with summary statistics and a full stage-by-stage
breakdown, so you can answer "how long, how many days, how hard, where does it start"
without opening a dozen tabs.

## Stack

Next.js 16 (App Router) · TypeScript · Bootstrap 5 + Sass Modules · Prisma 7 ·
PostgreSQL 16 · Auth.js (NextAuth v5) · Vitest

## Requirements

- **Node 20.19+** — Prisma 7's CLI refuses to run below this. The repo pins Node 22
  in `.nvmrc`; run `nvm use` before anything else.
- **Docker** for the local Postgres container.

## Getting started

```bash
nvm use                  # Node 22, per .nvmrc
npm install
cp .env.example .env
# then set AUTH_SECRET in .env:  openssl rand -base64 32
# (Google sign-in also needs AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET — see below)

open -a Docker           # first time, or after a reboot; wait for Docker Desktop to finish starting
npm run db:up            # start Postgres 16 on :5432

npx prisma migrate dev   # create the schema
npx prisma migrate deploy # migrate to prod
npx prisma db seed       # load the 15 routes and 191 stages

npm run dev              # http://localhost:3000
```

### Google sign-in setup

Email + password works with just `AUTH_SECRET`. For the "Continue with Google" button:

1. [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials → Create credentials → OAuth client ID → Web application**.
2. **Authorized JavaScript origins:** `http://localhost:3000` (and your production origin).
3. **Authorized redirect URIs:** `http://localhost:3000/api/auth/callback/google` (and `https://<prod-domain>/api/auth/callback/google`).
4. Copy the client ID and secret into `.env` as `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.
5. While the OAuth consent screen is unverified, add your Google account under **Test users**.

Accounts are keyed by email and not linked across methods: if you registered with a
password, sign in with the password (not Google) on that address, and vice versa.

If the container already exists from a previous session, use `npm run db:start`
instead of `db:up`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server on :3000 |
| `npm run build` / `start` | Production build and server |
| `npm test` | Vitest suite |
| `npm run lint` | ESLint |
| `npm run type-check` | `tsc --noEmit` |
| `npm run db:up` / `db:start` / `db:stop` / `db:down` | Postgres container lifecycle |
| `npm run db:studio` | Prisma Studio |
| `npm run migrate` / `seed` / `generate` | Prisma schema, seed data, client |

## How it fits together

Route data lives in **`src/data/official-routes.ts`** — a typed, hand-authored file
that is the single source of truth. `prisma/seed.ts` loads it into Postgres; the
Vitest suite validates it without needing a database at all.

```
src/
├── data/official-routes.ts   Seed source of truth (15 routes, 191 stages)
├── auth.ts                   Auth.js (NextAuth v5) config: Credentials + Google
├── lib/
│   ├── prisma.ts             PrismaClient singleton (dev-HMR safe)
│   ├── filters.ts            searchParams <-> RouteFilters, pure
│   ├── route-query.ts        RouteFilters -> Prisma where/orderBy, pure
│   ├── routes.ts             Route reads — touches the database
│   ├── user-routes.ts        Per-user saved-route reads/writes — touches the database
│   ├── users.ts              Credentials-signup user write — touches the database
│   ├── auth-dal.ts           getCurrentUser / requireUser — the authz choke point
│   ├── auth-validation.ts    Credentials-form input validation, pure
│   ├── route-status.ts       PLANNED | COMPLETED guard, pure
│   ├── actions/              'use server' actions (auth forms, saved-route toggles)
│   └── format.ts             Display helpers
├── app/[locale]/
│   ├── page.tsx              Catalog: filters + card grid
│   ├── routes/[slug]/        Detail: stats, description, stage table
│   ├── compare/              Side-by-side table for up to 4 routes
│   ├── login/ register/      Auth pages (email+password + Google)
│   └── my-routes/            Protected dashboard: Planned / Walked lists
├── app/api/auth/[...nextauth]/  Auth.js route handler (not locale-prefixed)
└── components/               One .module.scss beside each component
```

Two deliberate choices:

- **Filters live in the URL.** `?difficulty=HARD&maxDays=20` is parsed server-side and
  fed straight into one Prisma query, so every filtered view is a shareable link and
  there is no client state library.
- **`react-bootstrap` is not installed.** Bootstrap's stylesheet supplies the reset,
  grid and utilities; component-specific styling is Sass Modules. That keeps pages as
  Server Components — only `FilterBar` and the compare selection are client-side.

## Migrate DB to prod

```bash
nvm use

# 1. Make sure the prod schema is current. Use `deploy`, NOT `migrate dev`, in prod:
DATABASE_URL="<prod-connection-string>" npx prisma migrate deploy

# 2. Re-seed from official-routes.ts:
DATABASE_URL="<prod-connection-string>" npx prisma db seed
```

## Deploy

The app ships as a Docker image and deploys to a VPS (Postgres + Caddy for automatic HTTPS,
GitHub Actions builds/pushes/deploys on push to `main`). See [DEPLOY.md](DEPLOY.md) for the
one-time VPS setup and how redeploys work.

## Testing

```bash
npm test
```

80 tests, no database required. The one that earns its keep is `seed-data.test.ts`,
which checks the hand-authored route data for transcription errors: unique slugs,
stages that chain end to end (each stage starts where the last finished), stage
distances summing to within 5% of each route's stated total, and place names kept
clean enough to geocode later.

## Data accuracy

Distances and stage divisions follow common guidebook conventions and are approximate
(roughly ±1 km). Pilgrim numbers are rounded from Oficina del Peregrino arrival
statistics. This is a reference for comparing routes, not a substitute for a current
guidebook.

## Localization

The app is locale-prefixed (`/en/...`, `/uk/...`) via `next-intl`, with a `[locale]`
segment wrapping every page and UI chrome strings kept in `messages/en.json` /
`messages/uk.json`. Route and stage content (name, summary, description, place
names, stage notes) is translatable too, stored in `RouteTranslation` /
`StageTranslation` tables keyed by locale, with English used as a per-field
fallback wherever a translation is missing. `nameEs` (the route's native-language
name) always renders regardless of locale, and `countries` stays an untranslated
facet key — only its display label is translated. Currently two representative
routes (`camino-frances`, `camino-portugues-central`) have full Ukrainian content;
the rest fall back to English until translated.

The migration that introduced these translation tables
(`20260826211238_add_translation_tables`) drops the old flat text columns from
`Route` and `Stage` with no backfill — exactly like any other schema change here,
run `npx prisma migrate dev` followed by `npx prisma db seed` to repopulate route
and stage content afterward.

The auth pages (`/en/login`, `/en/register`, `/en/my-routes`, …) are locale-prefixed
like every other page. The Auth.js route handler at `/api/auth/*` is intentionally
**not** — it's excluded from the locale proxy's matcher.

## Accounts

Sign up with email + password or Google, then mark any route **Want to walk** or
**Walked** from its card, its detail page, or the `/my-routes` dashboard. A route
sits on at most one list — marking it Walked moves it off the Planned list.

Deliberately left out for now: email verification, password reset, and any
transactional email (there's no mail provider). Sessions are JWT-cookie based
(forced by the Credentials provider), so `AUTH_SECRET` must be stable across
restarts and deploys.

## Route map & GPX

Each route detail page shows a Leaflet map over free OpenStreetMap tiles, and lets
you download the whole route — or just the stages between two points you click —
as a GPX track.

**Stage marker coordinates** live in `src/data/official-routes.ts` as a
`STAGE_COORDS` dictionary (place name → `[lng, lat]`), written by
`scripts/geocode-stages.ts` (Nominatim) and checked by `seed-data.test.ts`
(valid range, chain-consistent, straight-line distance never exceeding the walked
distance). **Trail geometry** is one GeoJSON LineString per stage in
`src/data/tracks/<slug>.geojson`, built by `scripts/build-tracks.ts` from
OpenStreetMap route relations (`OSM_RELATIONS` in that file) via the Overpass API,
stitched and cut at the stage boundaries. `prisma/seed.ts` loads those files into
the `StageTrack` table; `getRouteTrack` in `src/lib/routes.ts` serves them through
`GET /api/routes/[slug]/track` (GeoJSON) and `GET /api/routes/[slug]/track.gpx`
(`?from=&to=` for a stage range).

OSM's Camino coverage is uneven. Any stage without usable geometry — no relation,
a big gap, or a marker sitting too far off the mapped way — **falls back to a
straight line between its markers**, in the map and the GPX alike; the map flags
this. Improve a route by adding or fixing its `OSM_RELATIONS` entry and re-running
`build-tracks.ts` — no code changes.

Regenerating the data (rare — the results are committed; be a good Nominatim /
Overpass citizen, 1 req/s, real User-Agent):

```bash
npx tsx scripts/geocode-stages.ts          # → STAGE_COORDS, review the git diff
npx tsx scripts/build-tracks.ts [slug ...]  # → src/data/tracks/*.geojson, eyeball on geojson.io
npx prisma db seed                          # load coordinates + tracks into Postgres
npm test
```

OSM data is ODbL: the map keeps the "© OpenStreetMap contributors" attribution and
exported GPX carries an ODbL `<copyright>`. Tiles are rendered from OSM's public
tile server at fair-use volume — swap to a paid provider if traffic grows.

## Not in this version

Accommodation data. Elevation profiles. Turn-by-turn navigation — the GPX is a
route line, not routing instructions.
