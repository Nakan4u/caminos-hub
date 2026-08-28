import { describe, expect, it } from 'vitest'
import { localizeRoute } from '@/lib/localize'
import type { Route, RouteTranslation } from '@/generated/prisma/client'

const baseRoute: Route = {
  id: 1,
  slug: 'camino-del-norte',
  nameEs: 'Camino del Norte',
  totalKm: 825,
  typicalDays: 34,
  difficulty: 'HARD',
  countries: ['Spain'],
  popularity: 45000,
  isUnesco: false,
}

const enRouteTranslation: RouteTranslation = {
  id: 1,
  routeId: 1,
  locale: 'en',
  name: 'Northern Way',
  summary: 'A coastal route.',
  description: 'A long coastal route along the north of Spain.',
  startPlace: 'Irun',
  endPlace: 'Santiago de Compostela',
  waymarking: 'Good',
  bestSeason: 'Summer',
}

describe('localizeRoute', () => {
  it('falls back to the English translation for every field when the uk row is entirely absent', () => {
    const route = { ...baseRoute, translations: [enRouteTranslation] }

    const localized = localizeRoute(route, 'uk')

    expect(localized).toEqual({
      slug: baseRoute.slug,
      nameEs: baseRoute.nameEs,
      totalKm: baseRoute.totalKm,
      typicalDays: baseRoute.typicalDays,
      difficulty: baseRoute.difficulty,
      countries: baseRoute.countries,
      popularity: baseRoute.popularity,
      isUnesco: baseRoute.isUnesco,
      name: enRouteTranslation.name,
      summary: enRouteTranslation.summary,
      description: enRouteTranslation.description,
      startPlace: enRouteTranslation.startPlace,
      endPlace: enRouteTranslation.endPlace,
      waymarking: enRouteTranslation.waymarking,
      bestSeason: enRouteTranslation.bestSeason,
    })
  })
})
