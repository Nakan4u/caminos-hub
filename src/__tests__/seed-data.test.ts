import { describe, expect, it } from 'vitest'
import { DIFFICULTIES } from '@/lib/filters'
import { officialRoutes } from '@/data/official-routes'
import { routeHasCoords } from '@/lib/track'
import { haversineMeters } from '@/lib/geo'

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

// Bounding box covering Iberia and south-west France, where every stage sits.
const LAT_RANGE = [35, 52] as const
const LNG_RANGE = [-10, 5] as const

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

  it('has geocoded stage coordinates for every route', () => {
    for (const route of officialRoutes) {
      expect(routeHasCoords(route.stages), `${route.slug} has no stage coordinates`).toBe(true)
    }
  })

  it.each(officialRoutes.map((route) => [route.slug, route] as const))(
    '%s has chain-consistent stage marker coordinates',
    (_slug, route) => {
      for (const stage of route.stages) {
        const coords = [stage.fromLat, stage.fromLng, stage.toLat, stage.toLng]
        const anySet = coords.some((c) => c !== undefined)
        if (!anySet) continue

        for (const c of coords) expect(typeof c === 'number' && Number.isFinite(c)).toBe(true)
        expect(stage.fromLat!).toBeGreaterThanOrEqual(LAT_RANGE[0])
        expect(stage.fromLat!).toBeLessThanOrEqual(LAT_RANGE[1])
        expect(stage.toLat!).toBeGreaterThanOrEqual(LAT_RANGE[0])
        expect(stage.toLat!).toBeLessThanOrEqual(LAT_RANGE[1])
        expect(stage.fromLng!).toBeGreaterThanOrEqual(LNG_RANGE[0])
        expect(stage.fromLng!).toBeLessThanOrEqual(LNG_RANGE[1])
        expect(stage.toLng!).toBeGreaterThanOrEqual(LNG_RANGE[0])
        expect(stage.toLng!).toBeLessThanOrEqual(LNG_RANGE[1])
      }

      // Each stage must start exactly where the previous one ended.
      for (let i = 1; i < route.stages.length; i += 1) {
        expect(route.stages[i].fromLat).toBe(route.stages[i - 1].toLat)
        expect(route.stages[i].fromLng).toBe(route.stages[i - 1].toLng)
      }

      expect(Number.isFinite(route.stages[0].fromLat)).toBe(true)
      expect(Number.isFinite(route.stages.at(-1)!.toLat)).toBe(true)

      // Straight-line endpoint distance can never exceed the walked distance;
      // a wrong geocode blows this up. Allow generous slack for marker drift.
      for (const stage of route.stages) {
        const straightKm =
          haversineMeters(
            [stage.fromLng!, stage.fromLat!],
            [stage.toLng!, stage.toLat!],
          ) / 1000
        expect(
          straightKm,
          `${route.slug} ${stage.fromPlace}→${stage.toPlace}: ${straightKm.toFixed(1)} km straight vs ${stage.distanceKm} km walked`,
        ).toBeLessThan(stage.distanceKm * 1.4 + 4)
      }
    },
  )

  it('only defines non-blank Ukrainian sub-fields wherever translations.uk is present', () => {
    for (const route of officialRoutes) {
      const uk = route.translations?.uk
      if (uk) {
        for (const value of Object.values(uk)) {
          if (value !== undefined) expect(value.trim().length).toBeGreaterThan(0)
        }
      }
    }
  })

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
