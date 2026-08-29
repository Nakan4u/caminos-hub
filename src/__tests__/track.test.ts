import { describe, expect, it } from 'vitest'
import {
  assembleRange,
  routeBounds,
  routeHasCoords,
  stageLine,
  toFeatureCollection,
  toMapStages,
  type StageGeom,
} from '@/lib/track'

function geom(...coords: [number, number][]) {
  return { coordinates: coords as [number, number][] }
}

const s1: StageGeom = {
  order: 1,
  fromPlace: 'A',
  toPlace: 'B',
  from: [0, 0],
  to: [0, 1],
  geometry: geom([0, 0], [0, 0.5], [0, 1]),
}
const s2: StageGeom = {
  order: 2,
  fromPlace: 'B',
  toPlace: 'C',
  from: [0, 1],
  to: [0, 2],
  geometry: geom([0, 1], [0, 1.5], [0, 2]),
}
const s3NoGeom: StageGeom = {
  order: 3,
  fromPlace: 'C',
  toPlace: 'D',
  from: [0, 2],
  to: [0, 3],
  geometry: null,
}

describe('stageLine', () => {
  it('returns the real geometry when present', () => {
    expect(stageLine(s1)).toEqual([
      [0, 0],
      [0, 0.5],
      [0, 1],
    ])
  })

  it('falls back to a straight from→to line when geometry is missing', () => {
    expect(stageLine(s3NoGeom)).toEqual([
      [0, 2],
      [0, 3],
    ])
  })

  it('returns nothing when geometry is missing and an endpoint is unknown', () => {
    expect(stageLine({ ...s3NoGeom, to: null })).toEqual([])
  })
})

describe('assembleRange', () => {
  it('returns a single stage untouched', () => {
    const r = assembleRange([s1, s2], 1, 1)
    expect(r.coordinates).toEqual([
      [0, 0],
      [0, 0.5],
      [0, 1],
    ])
    expect(r.segments).toHaveLength(1)
    expect(r.usedFallback).toBe(false)
  })

  it('concatenates stages, dropping the duplicated shared boundary vertex', () => {
    const r = assembleRange([s1, s2], 1, 2)
    // 3 + 3 - 1 shared vertex
    expect(r.coordinates).toHaveLength(5)
    expect(r.coordinates[0]).toEqual([0, 0])
    expect(r.coordinates.at(-1)).toEqual([0, 2])
    expect(r.segments.map((s) => s.order)).toEqual([1, 2])
  })

  it('filters to the requested order range', () => {
    const r = assembleRange([s1, s2, s3NoGeom], 2, 2)
    expect(r.segments.map((s) => s.order)).toEqual([2])
  })

  it('flags when any stage in range used the straight-line fallback', () => {
    const r = assembleRange([s1, s2, s3NoGeom], 1, 3)
    expect(r.usedFallback).toBe(true)
    expect(r.coordinates.at(-1)).toEqual([0, 3])
  })
})

describe('routeBounds', () => {
  it('spans the from/to points as [[south, west], [north, east]]', () => {
    const bounds = routeBounds([
      { ...s1, from: [-2, 40], to: [3, 41] },
      { ...s2, from: [3, 41], to: [1, 45] },
    ])
    expect(bounds).toEqual([
      [40, -2],
      [45, 3],
    ])
  })

  it('is null when no stage has coordinates', () => {
    expect(routeBounds([{ ...s3NoGeom, from: null, to: null }])).toBeNull()
  })
})

describe('routeHasCoords', () => {
  it('is true when at least one stage has a from coordinate', () => {
    expect(
      routeHasCoords([
        { fromLat: null, fromLng: null },
        { fromLat: 42.1, fromLng: -7.4 },
      ]),
    ).toBe(true)
  })

  it('is false when every coordinate is missing', () => {
    expect(routeHasCoords([{ fromLat: null, fromLng: null }])).toBe(false)
  })
})

describe('toFeatureCollection', () => {
  it('emits one LineString feature per drawable stage with stage metadata', () => {
    const fc = toFeatureCollection([s1, s3NoGeom]) as {
      type: string
      features: { geometry: { type: string }; properties: Record<string, unknown> }[]
    }
    expect(fc.type).toBe('FeatureCollection')
    expect(fc.features).toHaveLength(2)
    expect(fc.features[0].geometry.type).toBe('LineString')
    expect(fc.features[0].properties).toMatchObject({ stageOrder: 1, fallback: false })
    expect(fc.features[1].properties).toMatchObject({ stageOrder: 3, fallback: true })
  })
})

describe('toMapStages', () => {
  it('projects the four coordinate columns into [lng, lat] pairs', () => {
    const out = toMapStages([
      {
        order: 1,
        fromPlace: 'A',
        toPlace: 'B',
        fromLat: 42.78,
        fromLng: -7.41,
        toLat: 42.8,
        toLng: -7.61,
      },
    ])
    expect(out[0].from).toEqual([-7.41, 42.78])
    expect(out[0].to).toEqual([-7.61, 42.8])
  })

  it('yields null for a stage endpoint with a missing coordinate', () => {
    const out = toMapStages([
      {
        order: 1,
        fromPlace: 'A',
        toPlace: 'B',
        fromLat: 42.78,
        fromLng: null,
        toLat: null,
        toLng: null,
      },
    ])
    expect(out[0].from).toBeNull()
    expect(out[0].to).toBeNull()
  })
})
