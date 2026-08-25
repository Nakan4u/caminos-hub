import type { Prisma } from '@/generated/prisma/client'
import type { RouteFilters, SortKey } from '@/lib/filters'

const SEARCHABLE_FIELDS = [
  'name',
  'nameEs',
  'startPlace',
  'endPlace',
  'summary',
] as const

const ORDER_BY: Record<SortKey, Prisma.RouteOrderByWithRelationInput[]> = {
  popularity: [{ popularity: 'desc' }],
  'distance-asc': [{ totalKm: 'asc' }],
  'distance-desc': [{ totalKm: 'desc' }],
  'days-asc': [{ typicalDays: 'asc' }],
  name: [{ name: 'asc' }],
}

export function buildRouteQuery(filters: RouteFilters): {
  where: Prisma.RouteWhereInput
  orderBy: Prisma.RouteOrderByWithRelationInput[]
} {
  const where: Prisma.RouteWhereInput = {}

  if (filters.q) {
    where.OR = SEARCHABLE_FIELDS.map((field) => ({
      [field]: { contains: filters.q, mode: 'insensitive' as const },
    }))
  }
  if (filters.maxKm !== undefined) where.totalKm = { lte: filters.maxKm }
  if (filters.maxDays !== undefined) where.typicalDays = { lte: filters.maxDays }
  if (filters.difficulty?.length) where.difficulty = { in: filters.difficulty }
  if (filters.countries?.length) where.countries = { hasSome: filters.countries }

  return { where, orderBy: ORDER_BY[filters.sort] }
}
