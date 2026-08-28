---
name: full-stack-development
description: Use when building or modifying a full-stack feature — data layer, server/client rendering, forms, filtering, API routes, migrations — in this TypeScript / Next.js / Prisma / Vitest codebase. Covers isolating database access, keeping core logic pure and testable, server-first rendering, URL-driven state, and validating at boundaries.
---

# Full-Stack Development

## Overview

Full-stack features fail in predictable ways: query logic tangled into components,
database calls scattered across the tree, untrusted input trusted, client state where
a URL would do. The fix is consistent boundaries — a thin framework shell around a
pure, testable core, with one module owning I/O.

**Core principle:** push side effects (DB, network, framework glue) to the edges;
keep the middle pure.

## When to Use

- Adding or changing a page that reads from the database
- Adding filtering, sorting, search, or pagination
- Writing an API route / server action
- Changing the Prisma schema or adding a migration
- Building a form or any interactive component
- Reviewing a PR that touches data flow

Skip for: pure copy/style tweaks, config changes, docs.

## The Pipeline

Model every data-driven view as a one-way pipeline of small pure steps, then one I/O step:

```
searchParams / form data
  → parse       (untrusted input → typed shape; pure)
  → build query (typed shape → where/orderBy/args; pure)
  → fetch       (the ONLY module that touches the DB; server-only)
  → render      (Server Component; data in, markup out)
```

Each step is a separate module with one job, testable in isolation. In this repo:
`src/lib/filters.ts` (parse) → `src/lib/route-query.ts` (build) → `src/lib/routes.ts`
(fetch, marked `server-only`) → Server Component.

## Rules

### 1. One module owns the database
All Prisma calls live in a single data-access module per domain, marked `server-only`.
Everything else receives and returns plain typed data. No `prisma` import in a
component, route handler, or utility.

### 2. Core logic is pure
Parsing, query-building, formatting, and business rules are pure functions — no I/O,
no framework imports, deterministic. They get unit tests with no database (`npm test`
runs with none).

### 3. Server-first rendering
Default to Server Components. Add `"use client"` only on the leaf that needs
interactivity (event handlers, hooks, browser APIs) and keep it small. A client
component should not fetch what a parent server component could pass as props.

### 4. Shareable state lives in the URL
Filters, sort, tab, page → `searchParams`, parsed server-side. A filtered view is
then a copy-pasteable link. Reach for `useState` only for ephemeral UI (open menu,
hover, unsent input), never for state someone might want to bookmark or share.

### 5. Validate at the boundary
Parse untrusted input (URL params, form data, request bodies, external APIs) into a
typed shape once, at the edge, and reject/default what doesn't fit. Downstream code
trusts the type.

### 6. Schema change → migrate → reseed
After editing `prisma/schema.prisma`: `npx prisma migrate dev` then `npx prisma db seed`.
Update `src/data/official-routes.ts` (the source of truth) and its Vitest suite when
the shape of seeded data changes.

### 7. Colocated styling, minimal deps
One `Component.module.scss` beside each `Component.tsx`. Don't add a component library
or state-management dependency when CSS modules and the URL already cover it.

## Before Claiming Done

Run and read the output — do not assert success without it:

```bash
npm test           # vitest, no DB needed
npm run lint
npm run type-check  # tsc --noEmit
```

## Red Flags

| Symptom | What it means |
|---|---|
| `import { prisma }` outside the data module | I/O has leaked out of its boundary — move it back |
| `where:` / `orderBy:` built inside a component or route handler | Query-building belongs in a pure module with tests |
| `useState` holding a filter, sort, or selected tab | Belongs in the URL; make the view shareable |
| A `"use client"` component calling `fetch` for page data | Fetch on the server, pass as props |
| New nullable columns with no migration in the diff | Schema and DB are out of sync — `migrate dev` + `db seed` |
| Reading `searchParams` fields directly without a parse step | Untrusted input used unvalidated |
| "Tests pass" with no command output shown | Run it and paste the result |

## Common Mistakes

- **Folding parse + query + fetch into one function.** Keep them separate so the pure
  parts stay testable without a database.
- **Prop-drilling a Prisma model through client components.** Map to a plain
  view-model at the server boundary; clients get only what they render.
- **Editing seeded data in the DB instead of `src/data/official-routes.ts`.** The TS
  file is the source of truth; the database is derived.
- **Skipping `db seed` after a migration.** Destructive migrations drop columns with
  no backfill — the app looks broken until you reseed.
