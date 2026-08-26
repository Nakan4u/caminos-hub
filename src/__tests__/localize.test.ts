import { describe, expect, it } from 'vitest'
import { localizeRoute, localizeStage } from '@/lib/localize'
import type { Route, RouteTranslation, Stage, StageTranslation } from '@/generated/prisma/client'

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

const baseStage: Stage = {
  id: 1,
  routeId: 1,
  order: 1,
  distanceKm: 25.1,
  ascentM: 400,
}

const enStageTranslationWithNotes: StageTranslation = {
  id: 1,
  stageId: 1,
  locale: 'en',
  fromPlace: 'Irun',
  toPlace: 'San Sebastián',
  notes: 'A scenic coastal walk.',
}

const enStageTranslationWithoutNotes: StageTranslation = {
  id: 2,
  stageId: 1,
  locale: 'en',
  fromPlace: 'Irun',
  toPlace: 'San Sebastián',
  notes: null,
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

describe('localizeStage', () => {
  it('falls back to the English translation for every field when the uk row is entirely absent', () => {
    const stage = { ...baseStage, translations: [enStageTranslationWithNotes] }

    const localized = localizeStage(stage, 'uk')

    expect(localized).toEqual({
      order: baseStage.order,
      distanceKm: baseStage.distanceKm,
      ascentM: baseStage.ascentM,
      fromPlace: enStageTranslationWithNotes.fromPlace,
      toPlace: enStageTranslationWithNotes.toPlace,
      notes: enStageTranslationWithNotes.notes,
    })
  })

  it('resolves notes to null, not a crash or a wrong fallback, when the English row has no notes', () => {
    const stage = { ...baseStage, translations: [enStageTranslationWithoutNotes] }

    const localized = localizeStage(stage, 'uk')

    expect(localized.notes).toBeNull()
    expect(localized.fromPlace).toBe(enStageTranslationWithoutNotes.fromPlace)
    expect(localized.toPlace).toBe(enStageTranslationWithoutNotes.toPlace)
  })

  it('resolves notes to null for the requested locale too, when only an English row exists and it has no notes', () => {
    const stage = { ...baseStage, translations: [enStageTranslationWithoutNotes] }

    const localized = localizeStage(stage, 'en')

    expect(localized.notes).toBeNull()
  })
})
