import { describe, expect, it } from 'vitest'
import { buildRouteQuery } from '@/lib/route-query'
import { DEFAULT_SORT } from '@/lib/filters'

describe('buildRouteQuery', () => {
  it('produces an empty where clause when nothing is filtered', () => {
    expect(buildRouteQuery({ sort: DEFAULT_SORT }).where).toEqual({})
  })

  it('searches names and endpoints case-insensitively for a free-text query', () => {
    const { where } = buildRouteQuery({ q: 'norte', sort: DEFAULT_SORT })
    expect(where.OR).toHaveLength(5)
    for (const clause of where.OR!) {
      const [field] = Object.keys(clause)
      expect(['name', 'nameEs', 'startPlace', 'endPlace', 'summary']).toContain(field)
      expect(clause[field as keyof typeof clause]).toEqual({
        contains: 'norte',
        mode: 'insensitive',
      })
    }
  })

  it('turns the numeric bounds into upper limits', () => {
    const { where } = buildRouteQuery({ maxKm: 400, maxDays: 14, sort: DEFAULT_SORT })
    expect(where.totalKm).toEqual({ lte: 400 })
    expect(where.typicalDays).toEqual({ lte: 14 })
  })

  it('matches any selected difficulty', () => {
    const { where } = buildRouteQuery({
      difficulty: ['EASY', 'HARD'],
      sort: DEFAULT_SORT,
    })
    expect(where.difficulty).toEqual({ in: ['EASY', 'HARD'] })
  })

  it('matches routes crossing any selected country', () => {
    const { where } = buildRouteQuery({ countries: ['Portugal'], sort: DEFAULT_SORT })
    expect(where.countries).toEqual({ hasSome: ['Portugal'] })
  })

  it('combines every filter into one clause', () => {
    const { where } = buildRouteQuery({
      q: 'camino',
      maxKm: 500,
      maxDays: 20,
      difficulty: ['MODERATE'],
      countries: ['Spain'],
      sort: DEFAULT_SORT,
    })
    expect(Object.keys(where).sort()).toEqual([
      'OR',
      'countries',
      'difficulty',
      'totalKm',
      'typicalDays',
    ])
  })

  it('maps each sort key to a distinct ordering', () => {
    expect(buildRouteQuery({ sort: 'popularity' }).orderBy).toEqual([
      { popularity: 'desc' },
    ])
    expect(buildRouteQuery({ sort: 'distance-asc' }).orderBy).toEqual([
      { totalKm: 'asc' },
    ])
    expect(buildRouteQuery({ sort: 'distance-desc' }).orderBy).toEqual([
      { totalKm: 'desc' },
    ])
    expect(buildRouteQuery({ sort: 'days-asc' }).orderBy).toEqual([
      { typicalDays: 'asc' },
    ])
    expect(buildRouteQuery({ sort: 'name' }).orderBy).toEqual([{ name: 'asc' }])
  })
})
