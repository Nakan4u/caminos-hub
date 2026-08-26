import { describe, expect, it } from 'vitest'
import { DIFFICULTIES } from '@/lib/filters'
import { officialRoutes } from '@/data/official-routes'

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

describe('official route seed data', () => {
  it('contains all fifteen official routes', () => {
    expect(officialRoutes).toHaveLength(15)
  })

  it('has unique, URL-safe slugs', () => {
    const slugs = officialRoutes.map((route) => route.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const slug of slugs) expect(slug).toMatch(SLUG_PATTERN)
  })

  it.each(officialRoutes.map((route) => [route.slug, route] as const))(
    '%s has complete required fields',
    (_slug, route) => {
      const textFields = [
        route.name,
        route.nameEs,
        route.summary,
        route.description,
        route.startPlace,
        route.endPlace,
        route.waymarking,
        route.bestSeason,
      ]
      for (const value of textFields) expect(value.trim().length).toBeGreaterThan(0)

      expect(DIFFICULTIES).toContain(route.difficulty)
      expect(route.totalKm).toBeGreaterThan(0)
      expect(route.typicalDays).toBeGreaterThan(0)
      expect(route.popularity).toBeGreaterThan(0)
      expect(route.countries.length).toBeGreaterThan(0)
    },
  )

  it.each(officialRoutes.map((route) => [route.slug, route] as const))(
    '%s has a coherent stage list',
    (_slug, route) => {
      expect(route.stages.length).toBeGreaterThan(0)

      for (const stage of route.stages) {
        expect(stage.fromPlace.trim().length).toBeGreaterThan(0)
        expect(stage.toPlace.trim().length).toBeGreaterThan(0)
        expect(stage.distanceKm).toBeGreaterThan(0)
        expect(stage.distanceKm).toBeLessThan(50)
      }

      // Each stage must start where the previous one finished.
      for (let i = 1; i < route.stages.length; i += 1) {
        expect(route.stages[i].fromPlace).toBe(route.stages[i - 1].toPlace)
      }

      expect(route.stages[0].fromPlace).toBe(route.startPlace)
      expect(route.stages.at(-1)!.toPlace).toBe(route.endPlace)
    },
  )

  it.each(officialRoutes.map((route) => [route.slug, route] as const))(
    '%s stage distances sum to its stated total',
    (_slug, route) => {
      const sum = route.stages.reduce((total, stage) => total + stage.distanceKm, 0)
      expect(Math.abs(sum - route.totalKm) / route.totalKm).toBeLessThan(0.05)
    },
  )

  it.each(officialRoutes.map((route) => [route.slug, route] as const))(
    '%s typical days is plausible for its stage count',
    (_slug, route) => {
      expect(route.typicalDays).toBeGreaterThanOrEqual(route.stages.length - 2)
      expect(route.typicalDays).toBeLessThanOrEqual(route.stages.length + 2)
    },
  )

  it('keeps stage place names clean enough to geocode later', () => {
    for (const route of officialRoutes) {
      for (const stage of route.stages) {
        expect(stage.toPlace).not.toMatch(/[(),]|\bvia\b/i)
      }
    }
  })

  it('only defines non-blank Ukrainian sub-fields wherever translations.uk is present', () => {
    for (const route of officialRoutes) {
      const uk = route.translations?.uk
      if (uk) {
        for (const value of Object.values(uk)) {
          if (value !== undefined) expect(value.trim().length).toBeGreaterThan(0)
        }
      }

      for (const stage of route.stages) {
        const stageUk = stage.translations?.uk
        if (stageUk) {
          for (const value of Object.values(stageUk)) {
            if (value !== undefined) expect(value.trim().length).toBeGreaterThan(0)
          }
        }
      }
    }
  })

  it.each(officialRoutes.map((route) => [route.slug, route] as const))(
    '%s has consistent Ukrainian stage chaining wherever both sides are translated',
    (_slug, route) => {
      for (let i = 1; i < route.stages.length; i += 1) {
        const prevTo = route.stages[i - 1].translations?.uk?.toPlace
        const currentFrom = route.stages[i].translations?.uk?.fromPlace
        if (prevTo !== undefined && currentFrom !== undefined) {
          expect(currentFrom).toBe(prevTo)
        }
      }

      const firstFrom = route.stages[0].translations?.uk?.fromPlace
      const startPlaceUk = route.translations?.uk?.startPlace
      if (firstFrom !== undefined && startPlaceUk !== undefined) {
        expect(firstFrom).toBe(startPlaceUk)
      }

      const lastTo = route.stages.at(-1)!.translations?.uk?.toPlace
      const endPlaceUk = route.translations?.uk?.endPlace
      if (lastTo !== undefined && endPlaceUk !== undefined) {
        expect(lastTo).toBe(endPlaceUk)
      }
    },
  )

  it('maps every recurring English place name to exactly one Ukrainian value across the dataset', () => {
    const placeNames = new Map<string, Set<string>>()

    const record = (english: string, ukrainian: string | undefined) => {
      if (ukrainian === undefined) return
      const existing = placeNames.get(english) ?? new Set<string>()
      existing.add(ukrainian)
      placeNames.set(english, existing)
    }

    for (const route of officialRoutes) {
      record(route.startPlace, route.translations?.uk?.startPlace)
      record(route.endPlace, route.translations?.uk?.endPlace)
      for (const stage of route.stages) {
        record(stage.fromPlace, stage.translations?.uk?.fromPlace)
        record(stage.toPlace, stage.translations?.uk?.toPlace)
      }
    }

    for (const [english, ukrainianValues] of placeNames) {
      expect(ukrainianValues.size, `"${english}" maps to multiple Ukrainian values: ${[...ukrainianValues].join(', ')}`).toBe(1)
    }
  })

  it('has at least two routes with a translated Ukrainian name', () => {
    const translatedCount = officialRoutes.filter((route) => route.translations?.uk?.name).length
    expect(translatedCount).toBeGreaterThanOrEqual(2)
  })
})
