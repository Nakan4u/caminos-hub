import { describe, expect, it } from 'vitest'
import { buildRouteQuery } from '@/lib/route-query'
import { DEFAULT_SORT, SORT_VALUES, type SortKey } from '@/lib/filters'

describe('buildRouteQuery', () => {
  it('produces an empty where clause when nothing is filtered', () => {
    expect(buildRouteQuery({ sort: DEFAULT_SORT }, 'en').where).toEqual({})
  })

  it('searches translated fields via a relation filter, plus the untranslated nameEs column', () => {
    const { where } = buildRouteQuery({ q: 'norte', sort: DEFAULT_SORT }, 'en')
    expect(where.OR).toHaveLength(2)

    const [translationClause, nameEsClause] = where.OR!

    expect(nameEsClause).toEqual({ nameEs: { contains: 'norte', mode: 'insensitive' } })

    expect(translationClause).toEqual({
      translations: {
        some: {
          OR: [
            { name: { contains: 'norte', mode: 'insensitive' } },
            { startPlace: { contains: 'norte', mode: 'insensitive' } },
            { endPlace: { contains: 'norte', mode: 'insensitive' } },
            { summary: { contains: 'norte', mode: 'insensitive' } },
          ],
        },
      },
    })
  })

  it('searches every locale row at once, so an untranslated route is still findable by its English text', () => {
    // Same query, different locale requested for the eventual result set —
    // the search shape itself must not vary by locale.
    const en = buildRouteQuery({ q: 'frances', sort: DEFAULT_SORT }, 'en')
    const uk = buildRouteQuery({ q: 'frances', sort: DEFAULT_SORT }, 'uk')
    expect(uk.where).toEqual(en.where)
  })

  it('turns the numeric bounds into upper limits', () => {
    const { where } = buildRouteQuery({ maxKm: 400, maxDays: 14, sort: DEFAULT_SORT }, 'en')
    expect(where.totalKm).toEqual({ lte: 400 })
    expect(where.typicalDays).toEqual({ lte: 14 })
  })

  it('matches any selected difficulty', () => {
    const { where } = buildRouteQuery(
      { difficulty: ['EASY', 'HARD'], sort: DEFAULT_SORT },
      'en',
    )
    expect(where.difficulty).toEqual({ in: ['EASY', 'HARD'] })
  })

  it('matches routes crossing any selected country', () => {
    const { where } = buildRouteQuery({ countries: ['Portugal'], sort: DEFAULT_SORT }, 'en')
    expect(where.countries).toEqual({ hasSome: ['Portugal'] })
  })

  it('combines every filter into one clause', () => {
    const { where } = buildRouteQuery(
      {
        q: 'camino',
        maxKm: 500,
        maxDays: 20,
        difficulty: ['MODERATE'],
        countries: ['Spain'],
        sort: DEFAULT_SORT,
      },
      'en',
    )
    expect(Object.keys(where).sort()).toEqual([
      'OR',
      'countries',
      'difficulty',
      'totalKm',
      'typicalDays',
    ])
  })

  it('maps each non-name sort key to a distinct scalar ordering, the same regardless of locale', () => {
    const nonNameSorts = SORT_VALUES.filter((sort): sort is Exclude<SortKey, 'name'> => sort !== 'name')

    for (const sort of nonNameSorts) {
      const en = buildRouteQuery({ sort }, 'en').orderBy
      const uk = buildRouteQuery({ sort }, 'uk').orderBy
      expect(uk).toEqual(en)
    }

    expect(buildRouteQuery({ sort: 'popularity' }, 'en').orderBy).toEqual([
      { popularity: 'desc' },
    ])
    expect(buildRouteQuery({ sort: 'distance-asc' }, 'en').orderBy).toEqual([
      { totalKm: 'asc' },
    ])
    expect(buildRouteQuery({ sort: 'distance-desc' }, 'en').orderBy).toEqual([
      { totalKm: 'desc' },
    ])
    expect(buildRouteQuery({ sort: 'days-asc' }, 'en').orderBy).toEqual([
      { typicalDays: 'asc' },
    ])
  })

  it('omits orderBy for sort: name regardless of locale — Prisma cannot order through the translations relation', () => {
    expect(buildRouteQuery({ sort: 'name' }, 'en').orderBy).toBeUndefined()
    expect(buildRouteQuery({ sort: 'name' }, 'uk').orderBy).toBeUndefined()
  })
})
