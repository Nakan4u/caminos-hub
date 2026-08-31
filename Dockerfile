# syntax=docker/dockerfile:1

# Debian slim, not alpine — Prisma's migration engine has known musl/OpenSSL
# issues on alpine. Pin the major version to match .nvmrc (Node 22).
FROM node:22-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# ---- deps: install all dependencies (dev included, needed to build) --------
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npm ci

# ---- builder: compile the app ----------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# The Prisma client is generated to src/generated (prisma/schema.prisma
# `output`), which is gitignored and therefore absent from the build context.
# Regenerate it here so the build can resolve `@/generated/prisma/client`.
# `next build` also evaluates route modules (e.g. /api/avatar/[id]) to collect
# page data, which constructs the Prisma client at import time. The pg driver
# adapter only opens a connection lazily on first query, so a syntactically
# valid but unreachable URL is enough to get through both steps — it is never
# connected to. The real DATABASE_URL is supplied at container runtime.
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npx prisma generate
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npm run build

# ---- runner: production-only node_modules + built output ------------------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

COPY package.json package-lock.json ./
COPY prisma.config.ts ./prisma.config.ts
COPY prisma ./prisma
# postinstall runs `prisma generate`, which (via prisma.config.ts) requires
# DATABASE_URL to be resolvable even just to generate the client — scoped to
# this instruction only, so it doesn't persist as a default in the final
# image (the real value always comes from the runtime env_file).
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
# Not needed to serve the already-compiled .next output — only so the manual
# `npx prisma db seed` one-off (prisma/seed.ts, run via tsx) can read the
# route/stage source data and track geometry directly.
COPY --from=builder /app/src/data ./src/data
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh && chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]
