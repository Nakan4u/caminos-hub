export const DIFFICULTIES = ['EASY', 'MODERATE', 'HARD'] as const
export type Difficulty = (typeof DIFFICULTIES)[number]

export const SORT_VALUES = [
  'popularity',
  'distance-asc',
  'distance-desc',
  'days-asc',
  'name',
] as const

export type SortKey = (typeof SORT_VALUES)[number]
export const DEFAULT_SORT: SortKey = 'popularity'

export type SearchParams = Record<string, string | string[] | undefined>

export interface RouteFilters {
  q?: string
  maxKm?: number
  maxDays?: number
  difficulty?: Difficulty[]
  countries?: string[]
  sort: SortKey
}

/** Accepts both `?difficulty=EASY,HARD` and `?difficulty=EASY&difficulty=HARD`. */
function toList(value: string | string[] | undefined): string[] {
  const raw = Array.isArray(value) ? value : value === undefined ? [] : [value]
  const parts = raw.flatMap((entry) => entry.split(','))
  return [...new Set(parts.map((part) => part.trim()).filter(Boolean))]
}

function toPositiveInt(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw === undefined) return undefined
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

function isDifficulty(value: string): value is Difficulty {
  return (DIFFICULTIES as readonly string[]).includes(value)
}

function isSortKey(value: string): value is SortKey {
  return (SORT_VALUES as readonly string[]).includes(value)
}

export function parseFilters(searchParams: SearchParams): RouteFilters {
  const filters: RouteFilters = { sort: DEFAULT_SORT }

  const rawQ = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q
  const q = rawQ?.trim()
  if (q) filters.q = q

  const maxKm = toPositiveInt(searchParams.maxKm)
  if (maxKm !== undefined) filters.maxKm = maxKm

  const maxDays = toPositiveInt(searchParams.maxDays)
  if (maxDays !== undefined) filters.maxDays = maxDays

  const difficulty = toList(searchParams.difficulty).filter(isDifficulty)
  if (difficulty.length) filters.difficulty = difficulty

  const countries = toList(searchParams.countries)
  if (countries.length) filters.countries = countries

  const rawSort = Array.isArray(searchParams.sort)
    ? searchParams.sort[0]
    : searchParams.sort
  if (rawSort && isSortKey(rawSort)) filters.sort = rawSort

  return filters
}

export function filtersToQueryString(filters: RouteFilters): string {
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.maxKm !== undefined) params.set('maxKm', String(filters.maxKm))
  if (filters.maxDays !== undefined) params.set('maxDays', String(filters.maxDays))
  if (filters.difficulty?.length) params.set('difficulty', filters.difficulty.join(','))
  if (filters.countries?.length) params.set('countries', filters.countries.join(','))
  if (filters.sort !== DEFAULT_SORT) params.set('sort', filters.sort)
  return params.toString()
}

export function hasActiveFilters(filters: RouteFilters): boolean {
  return Boolean(
    filters.q ||
      filters.maxKm !== undefined ||
      filters.maxDays !== undefined ||
      filters.difficulty?.length ||
      filters.countries?.length,
  )
}
