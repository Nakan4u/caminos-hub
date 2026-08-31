#!/bin/sh
# Runs on every container start. `prisma migrate deploy` is idempotent (a
# no-op once the schema is current), so it's safe to run unconditionally
# rather than requiring a separate manual migration step on each deploy.
#
# Deliberately NOT running `prisma db seed` here — prisma/seed.ts does
# deleteMany() + recreate, which would wipe user data on every restart.
# Seeding stays a manual one-off: `docker compose exec app npx prisma db seed`.
set -e

echo "Running database migrations..."
npx prisma migrate deploy

exec "$@"
