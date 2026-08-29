import 'server-only'
import { prisma } from '@/lib/prisma'
import { buildRouteQuery } from '@/lib/route-query'
import { localeAndFallback, localizeRoute } from '@/lib/localize'
import { parseLineString, type LngLat } from '@/lib/geo'
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

function toLngLat(lng: number | null, lat: number | null): LngLat | null {
  if (lng == null || lat == null) return null
  return [lng, lat]
}

/**
 * A route's per-stage track geometry for the map/GPX endpoints. Deliberately
 * separate from `getRouteBySlug` — the `StageTrack.geometry` JSON is large and
 * only these two API routes need it. `nameEs` feeds the GPX `<name>` (it is
 * locale-independent and `/api` has no locale anyway).
 */
export async function getRouteTrack(slug: string) {
  const route = await prisma.route.findUnique({
    where: { slug },
    select: {
      slug: true,
      nameEs: true,
      stages: {
        orderBy: { order: 'asc' },
        select: {
          order: true,
          fromPlace: true,
          toPlace: true,
          fromLat: true,
          fromLng: true,
          toLat: true,
          toLng: true,
          distanceKm: true,
          track: { select: { geometry: true } },
        },
      },
    },
  })
  if (!route) return null

  return {
    slug: route.slug,
    nameEs: route.nameEs,
    stages: route.stages.map((stage) => ({
      order: stage.order,
      fromPlace: stage.fromPlace,
      toPlace: stage.toPlace,
      distanceKm: stage.distanceKm,
      from: toLngLat(stage.fromLng, stage.fromLat),
      to: toLngLat(stage.toLng, stage.toLat),
      geometry: parseLineString(stage.track?.geometry),
    })),
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
export type RouteTrack = NonNullable<Awaited<ReturnType<typeof getRouteTrack>>>
