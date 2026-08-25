# Camino-Hub

Browse, filter and compare the **official routes of the Camino de Santiago**.

Fifteen recognised routes, each with summary statistics and a full stage-by-stage
breakdown, so you can answer "how long, how many days, how hard, where does it start"
without opening a dozen tabs.

## Stack

Next.js 16 (App Router) · TypeScript · Bootstrap 5 + Sass Modules · Prisma 7 ·
PostgreSQL 16 · Vitest

## Requirements

- **Node 20.19+** — Prisma 7's CLI refuses to run below this. The repo pins Node 22
  in `.nvmrc`; run `nvm use` before anything else.
- **Podman** (or Docker) for the local Postgres container.

## Getting started

```bash
nvm use                  # Node 22, per .nvmrc
npm install
cp .env.example .env

podman machine start     # first time, or after a reboot
npm run db:up            # start Postgres 16 on :5432

npx prisma migrate dev   # create the schema
npx prisma db seed       # load the 15 routes and 191 stages

npm run dev              # http://localhost:3000
```

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
├── lib/
│   ├── prisma.ts             PrismaClient singleton (dev-HMR safe)
│   ├── filters.ts            searchParams <-> RouteFilters, pure
│   ├── route-query.ts        RouteFilters -> Prisma where/orderBy, pure
│   ├── routes.ts             The only module that touches the database
│   └── format.ts             Display helpers
├── app/
│   ├── page.tsx              Catalog: filters + card grid
│   ├── routes/[slug]/        Detail: stats, description, stage table
│   └── compare/              Side-by-side table for up to 4 routes
└── components/               One .module.scss beside each component
```

Two deliberate choices:

- **Filters live in the URL.** `?difficulty=HARD&maxDays=20` is parsed server-side and
  fed straight into one Prisma query, so every filtered view is a shareable link and
  there is no client state library.
- **`react-bootstrap` is not installed.** Bootstrap's stylesheet supplies the reset,
  grid and utilities; component-specific styling is Sass Modules. That keeps pages as
  Server Components — only `FilterBar` and the compare selection are client-side.

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

## Not in this version

Maps, accommodation data, user accounts and saved itineraries, and i18n (English
only). A route map is the intended next step: `Stage` would gain nullable
`lat`/`lng`, populated by a one-off geocoding script and drawn with Leaflet over free
OpenStreetMap tiles. Stage place names are already kept clean so that script will
work without manual cleanup.
