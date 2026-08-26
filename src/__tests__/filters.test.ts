import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SORT,
  SORT_VALUES,
  filtersToQueryString,
  parseFilters,
} from '@/lib/filters'

describe('parseFilters', () => {
  it('returns only defaults when no params are present', () => {
    expect(parseFilters({})).toEqual({ sort: DEFAULT_SORT })
  })

  it('trims the free-text query and drops it when blank', () => {
    expect(parseFilters({ q: '  primitivo  ' }).q).toBe('primitivo')
    expect(parseFilters({ q: '   ' }).q).toBeUndefined()
  })

  it('parses numeric bounds and rejects junk', () => {
    expect(parseFilters({ maxKm: '400' }).maxKm).toBe(400)
    expect(parseFilters({ maxDays: '14' }).maxDays).toBe(14)
    expect(parseFilters({ maxKm: 'abc' }).maxKm).toBeUndefined()
    expect(parseFilters({ maxKm: '-5' }).maxKm).toBeUndefined()
    expect(parseFilters({ maxKm: '0' }).maxKm).toBeUndefined()
    expect(parseFilters({ maxKm: '12.7' }).maxKm).toBe(12)
  })

  it('accepts difficulty as a comma list and discards unknown values', () => {
    expect(parseFilters({ difficulty: 'EASY,HARD' }).difficulty).toEqual([
      'EASY',
      'HARD',
    ])
    expect(parseFilters({ difficulty: 'EASY,BANANA' }).difficulty).toEqual(['EASY'])
    expect(parseFilters({ difficulty: 'BANANA' }).difficulty).toBeUndefined()
  })

  it('accepts a repeated param as well as a comma list', () => {
    expect(parseFilters({ difficulty: ['EASY', 'MODERATE'] }).difficulty).toEqual([
      'EASY',
      'MODERATE',
    ])
    expect(parseFilters({ countries: ['Spain', 'Portugal'] }).countries).toEqual([
      'Spain',
      'Portugal',
    ])
  })

  it('de-duplicates repeated values', () => {
    expect(parseFilters({ difficulty: 'EASY,EASY' }).difficulty).toEqual(['EASY'])
  })

  it('falls back to the default sort for an unknown sort key', () => {
    expect(parseFilters({ sort: 'nonsense' }).sort).toBe(DEFAULT_SORT)
    for (const value of SORT_VALUES) {
      expect(parseFilters({ sort: value }).sort).toBe(value)
    }
  })
})

describe('filtersToQueryString', () => {
  it('omits empty values and the default sort', () => {
    expect(filtersToQueryString({ sort: DEFAULT_SORT })).toBe('')
  })

  it('serialises every populated field', () => {
    const qs = filtersToQueryString({
      q: 'norte',
      maxKm: 900,
      maxDays: 40,
      difficulty: ['HARD'],
      countries: ['Spain'],
      sort: 'distance-asc',
    })
    const params = new URLSearchParams(qs)
    expect(params.get('q')).toBe('norte')
    expect(params.get('maxKm')).toBe('900')
    expect(params.get('maxDays')).toBe('40')
    expect(params.get('difficulty')).toBe('HARD')
    expect(params.get('countries')).toBe('Spain')
    expect(params.get('sort')).toBe('distance-asc')
  })

  it('round-trips through parseFilters unchanged', () => {
    const filters = {
      q: 'camino',
      maxKm: 500,
      maxDays: 21,
      difficulty: ['EASY', 'HARD'] as const,
      countries: ['Spain', 'France'],
      sort: 'name' as const,
    }
    const qs = filtersToQueryString({ ...filters, difficulty: [...filters.difficulty] })
    const parsed = parseFilters(Object.fromEntries(new URLSearchParams(qs)))
    expect(parsed).toEqual({ ...filters, difficulty: [...filters.difficulty] })
  })
})
