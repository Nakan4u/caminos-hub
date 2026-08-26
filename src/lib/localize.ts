import type { Route, RouteTranslation, Stage, StageTranslation } from '@/generated/prisma/client'

type RouteWithTranslations = Route & { translations: RouteTranslation[] }
type StageWithTranslations = Stage & { translations: StageTranslation[] }

export type LocalizedRoute = Pick<
  Route,
  'slug' | 'nameEs' | 'totalKm' | 'typicalDays' | 'difficulty' | 'countries' | 'popularity' | 'isUnesco'
> &
  Pick<RouteTranslation, 'name' | 'summary' | 'description' | 'startPlace' | 'endPlace' | 'waymarking' | 'bestSeason'>

export type LocalizedStage = Pick<Stage, 'order' | 'distanceKm' | 'ascentM'> &
  Pick<StageTranslation, 'fromPlace' | 'toPlace' | 'notes'>

/** Resolves one translatable field: the locale's own value, falling back to the English row's. */
function resolveField<T extends { locale: string }, K extends keyof T>(translations: T[], locale: string, field: K): T[K] {
  return translations.find((t) => t.locale === locale)?.[field] ?? translations.find((t) => t.locale === 'en')![field]
}

/** Resolves a Route's translated fields for `locale`, falling back to English per-field, merged with its untranslated structural fields. */
export function localizeRoute(route: RouteWithTranslations, locale: string): LocalizedRoute {
  const { slug, nameEs, totalKm, typicalDays, difficulty, countries, popularity, isUnesco, translations } = route
  return {
    slug,
    nameEs,
    totalKm,
    typicalDays,
    difficulty,
    countries,
    popularity,
    isUnesco,
    name: resolveField(translations, locale, 'name'),
    summary: resolveField(translations, locale, 'summary'),
    description: resolveField(translations, locale, 'description'),
    startPlace: resolveField(translations, locale, 'startPlace'),
    endPlace: resolveField(translations, locale, 'endPlace'),
    waymarking: resolveField(translations, locale, 'waymarking'),
    bestSeason: resolveField(translations, locale, 'bestSeason'),
  }
}

/** Resolves a Stage's translated fields for `locale`, falling back to English per-field, merged with its untranslated structural fields. */
export function localizeStage(stage: StageWithTranslations, locale: string): LocalizedStage {
  const { order, distanceKm, ascentM, translations } = stage
  return {
    order,
    distanceKm,
    ascentM,
    fromPlace: resolveField(translations, locale, 'fromPlace'),
    toPlace: resolveField(translations, locale, 'toPlace'),
    notes: resolveField(translations, locale, 'notes'),
  }
}
