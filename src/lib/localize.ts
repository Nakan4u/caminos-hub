import type { Route, RouteTranslation, Stage, StageTranslation } from '@/generated/prisma/client'

type RouteWithTranslations = Route & { translations: RouteTranslation[] }
type StageWithTranslations = Stage & { translations: StageTranslation[] }

/** Every field of `T` picked by `K`, widened by dropping `null` — used for the translated
 *  fields below, which the schema types nullable for future partial translations but which
 *  are always populated on the `en` row that every route/stage falls back to. */
type NonNullablePick<T, K extends keyof T> = { [P in K]: NonNullable<T[P]> }

export type LocalizedRoute = Pick<
  Route,
  'slug' | 'nameEs' | 'totalKm' | 'typicalDays' | 'difficulty' | 'countries' | 'popularity' | 'isUnesco'
> &
  NonNullablePick<
    RouteTranslation,
    'name' | 'summary' | 'description' | 'startPlace' | 'endPlace' | 'waymarking' | 'bestSeason'
  >

export type LocalizedStage = Pick<Stage, 'order' | 'distanceKm' | 'ascentM'> &
  NonNullablePick<StageTranslation, 'fromPlace' | 'toPlace' | 'notes'>

/**
 * Resolves one translatable field: the locale's own value, falling back to the English row's.
 * The Prisma schema types these columns nullable (`String?`) so future locales can ship partial
 * translations, but the `en` row is always fully populated — every field here is required and
 * non-nullable on `official-routes.ts`'s canonical English authoring surface (enforced by
 * `seed-data.test.ts`) — so the resolved value is asserted non-null.
 */
function resolveField<T extends { locale: string }, K extends keyof T>(
  translations: T[],
  locale: string,
  field: K,
): NonNullable<T[K]> {
  const value = translations.find((t) => t.locale === locale)?.[field] ?? translations.find((t) => t.locale === 'en')![field]
  return value as NonNullable<T[K]>
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
