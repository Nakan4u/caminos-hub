import 'server-only'
import { prisma } from '@/lib/prisma'
import { buildRouteQuery } from '@/lib/route-query'
import { localeAndFallback, localizeRoute } from '@/lib/localize'
import type { RouteFilters } from '@/lib/filters'

export async function listRoutes(filters: RouteFilters, locale: string) {
  const { where, orderBy } = buildRouteQuery(filters, locale)
  const routes = await prisma.route.findMany({
    where,
    orderBy,
    include: { translations: { where: { locale: { in: localeAndFallback(locale) } } } },
  })
  const localized = routes.map((route) => localizeRoute(route, locale))

  if (filters.sort === 'name') {
    localized.sort((a, b) => a.name.localeCompare(b.name, locale))
  }

  return localized
}

export async function getRouteBySlug(slug: string, locale: string) {
  const route = await prisma.route.findUnique({
    where: { slug },
    include: {
      translations: { where: { locale: { in: localeAndFallback(locale) } } },
      stages: { orderBy: { order: 'asc' } },
    },
  })
  if (!route) return null

  return {
    ...localizeRoute(route, locale),
    stages: route.stages,
  }
}

/** Returns the requested routes in the order the caller asked for them. */
export async function getRoutesBySlugs(slugs: string[], locale: string) {
  const routes = await prisma.route.findMany({
    where: { slug: { in: slugs } },
    include: { translations: { where: { locale: { in: localeAndFallback(locale) } } } },
  })
  const bySlug = new Map(routes.map((route) => [route.slug, route]))
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((route) => route !== undefined)
    .map((route) => localizeRoute(route, locale))
}

/** Every country any route passes through, for the filter bar. */
export async function listCountries() {
  const routes = await prisma.route.findMany({ select: { countries: true } })
  return [...new Set(routes.flatMap((route) => route.countries))].sort()
}

export type RouteSummary = Awaited<ReturnType<typeof listRoutes>>[number]
export type RouteWithStages = NonNullable<Awaited<ReturnType<typeof getRouteBySlug>>>
