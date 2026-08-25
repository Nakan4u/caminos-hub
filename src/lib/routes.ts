import 'server-only'
import { prisma } from '@/lib/prisma'
import { buildRouteQuery } from '@/lib/route-query'
import type { RouteFilters } from '@/lib/filters'

export async function listRoutes(filters: RouteFilters) {
  const { where, orderBy } = buildRouteQuery(filters)
  return prisma.route.findMany({ where, orderBy })
}

export async function getRouteBySlug(slug: string) {
  return prisma.route.findUnique({
    where: { slug },
    include: { stages: { orderBy: { order: 'asc' } } },
  })
}

/** Returns the requested routes in the order the caller asked for them. */
export async function getRoutesBySlugs(slugs: string[]) {
  const routes = await prisma.route.findMany({ where: { slug: { in: slugs } } })
  const bySlug = new Map(routes.map((route) => [route.slug, route]))
  return slugs.map((slug) => bySlug.get(slug)).filter((route) => route !== undefined)
}

export async function listRouteSlugs() {
  const routes = await prisma.route.findMany({ select: { slug: true } })
  return routes.map((route) => route.slug)
}

/** Every country any route passes through, for the filter bar. */
export async function listCountries() {
  const routes = await prisma.route.findMany({ select: { countries: true } })
  return [...new Set(routes.flatMap((route) => route.countries))].sort()
}

export type RouteSummary = Awaited<ReturnType<typeof listRoutes>>[number]
export type RouteWithStages = NonNullable<Awaited<ReturnType<typeof getRouteBySlug>>>
