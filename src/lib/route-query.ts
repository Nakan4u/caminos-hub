import type { Prisma } from '@/generated/prisma/client'
import type { RouteFilters, SortKey } from '@/lib/filters'

/** Scalar-column orderings; `name` sort has no entry here because Prisma cannot
 *  `orderBy` through the one-to-many `translations` relation — it's resolved
 *  in-memory after localizing, in `src/lib/routes.ts`. */
const ORDER_BY: Partial<Record<SortKey, Prisma.RouteOrderByWithRelationInput[]>> = {
  popularity: [{ popularity: 'desc' }],
  'distance-asc': [{ totalKm: 'asc' }],
  'distance-desc': [{ totalKm: 'desc' }],
  'days-asc': [{ typicalDays: 'asc' }],
}

export function buildRouteQuery(
  filters: RouteFilters,
  locale: string,
): {
  where: Prisma.RouteWhereInput
  orderBy: Prisma.RouteOrderByWithRelationInput[] | undefined
} {
  // `locale` isn't used to shape the where/orderBy: search is locale-agnostic
  // (it matches across every translation row so untranslated routes are still
  // findable by their English text), and name-sort is always deferred to
  // routes.ts regardless of which locale it's eventually sorted in.
  void locale

  const where: Prisma.RouteWhereInput = {}

  if (filters.q) {
    const contains = { contains: filters.q, mode: 'insensitive' as const }
    where.OR = [
      {
        translations: {
          some: {
            OR: [
              { name: contains },
              { startPlace: contains },
              { endPlace: contains },
              { summary: contains },
            ],
          },
        },
      },
      { nameEs: contains },
    ]
  }
  if (filters.maxKm !== undefined) where.totalKm = { lte: filters.maxKm }
  if (filters.maxDays !== undefined) where.typicalDays = { lte: filters.maxDays }
  if (filters.difficulty?.length) where.difficulty = { in: filters.difficulty }
  if (filters.countries?.length) where.countries = { hasSome: filters.countries }

  return { where, orderBy: ORDER_BY[filters.sort] }
}
