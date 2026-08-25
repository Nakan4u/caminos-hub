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
})
