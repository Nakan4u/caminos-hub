import { describe, expect, it } from 'vitest'
import {
  cumulativeMeters,
  haversineMeters,
  inBBox,
  nearestOnPolyline,
  parseLineString,
  polylineLengthMeters,
  sliceByDistance,
  type LngLat,
} from '@/lib/geo'

/** One degree of latitude in metres on a sphere of radius 6371 km. */
const DEG_LAT_M = 111_194.9

const MADRID: LngLat = [-3.7038, 40.4168]
const BARCELONA: LngLat = [2.1734, 41.3851]

function expectClose(actual: number, expected: number, tolerance: number) {
  expect(Math.abs(actual - expected)).toBeLessThan(tolerance)
}

describe('haversineMeters', () => {
  it('matches the known Madrid–Barcelona great-circle distance within 1%', () => {
    const d = haversineMeters(MADRID, BARCELONA)
    expectClose(d, 505_000, 5_050)
  })

  it('is zero for identical points', () => {
    expect(haversineMeters(MADRID, MADRID)).toBe(0)
  })

  it('is symmetric', () => {
    expect(haversineMeters(MADRID, BARCELONA)).toBeCloseTo(
      haversineMeters(BARCELONA, MADRID),
      6,
    )
  })

  it('measures one degree of latitude as ~111.2 km', () => {
    expectClose(haversineMeters([0, 0], [0, 1]), DEG_LAT_M, 50)
  })
})

describe('cumulativeMeters', () => {
  const line: LngLat[] = [
    [0, 0],
    [0, 1],
    [1, 1],
  ]

  it('starts at zero and has one entry per vertex', () => {
    const cum = cumulativeMeters(line)
    expect(cum).toHaveLength(3)
    expect(cum[0]).toBe(0)
  })

  it('accumulates each segment length', () => {
    const cum = cumulativeMeters(line)
    expectClose(cum[1], DEG_LAT_M, 50)
    // second leg is one degree of longitude at latitude 1°, slightly shorter
    expectClose(cum[2] - cum[1], DEG_LAT_M * Math.cos((1 * Math.PI) / 180), 50)
  })

  it('returns [0] for a single-point line', () => {
    expect(cumulativeMeters([[0, 0]])).toEqual([0])
  })
})

describe('polylineLengthMeters', () => {
  it('equals the last cumulative value', () => {
    const line: LngLat[] = [
      [0, 0],
      [0, 1],
      [0, 2],
    ]
    expectClose(polylineLengthMeters(line), 2 * DEG_LAT_M, 100)
  })

  it('is zero for a degenerate line', () => {
    expect(polylineLengthMeters([[1, 1]])).toBe(0)
  })
})

describe('nearestOnPolyline', () => {
  const line: LngLat[] = [
    [0, 0],
    [0, 1],
    [1, 1],
  ]

  it('snaps a query point sitting on a vertex', () => {
    const r = nearestOnPolyline(line, [0, 1])
    expect(r.distToLineMeters).toBeLessThan(1)
    expectClose(r.distAlongMeters, DEG_LAT_M, 50)
  })

  it('finds the perpendicular foot in the middle of a segment', () => {
    const r = nearestOnPolyline(
      [
        [0, 0],
        [0, 2],
      ],
      [0.001, 1],
    )
    expectClose(r.distAlongMeters, DEG_LAT_M, 100)
    // 0.001° of longitude at the equator ≈ 111 m off the line
    expectClose(r.distToLineMeters, 111, 15)
    expect(r.point[0]).toBeCloseTo(0, 4)
    expect(r.point[1]).toBeCloseTo(1, 4)
  })

  it('clamps a query point beyond the final vertex to the line end', () => {
    const r = nearestOnPolyline(
      [
        [0, 0],
        [0, 1],
      ],
      [0, 2],
    )
    expectClose(r.distAlongMeters, DEG_LAT_M, 50)
    expectClose(r.distToLineMeters, DEG_LAT_M, 50)
    expect(r.point[1]).toBeCloseTo(1, 4)
  })
})

describe('sliceByDistance', () => {
  const line: LngLat[] = [
    [0, 0],
    [0, 1],
    [0, 2],
  ]
  const total = polylineLengthMeters(line)

  it('returns the whole line for the full distance range', () => {
    const out = sliceByDistance(line, 0, total)
    expect(out).toHaveLength(3)
    expect(out[0]).toEqual([0, 0])
    expect(out[2][1]).toBeCloseTo(2, 4)
  })

  it('keeps interior vertices between the cut points', () => {
    const out = sliceByDistance(line, total * 0.25, total * 0.75)
    expect(out).toHaveLength(3)
    expect(out[0][1]).toBeCloseTo(0.5, 3)
    expect(out[1]).toEqual([0, 1])
    expect(out[2][1]).toBeCloseTo(1.5, 3)
  })

  it('clamps out-of-range distances to the line', () => {
    const out = sliceByDistance(line, -100, total + 999_999)
    expect(out[0]).toEqual([0, 0])
    expect(out.at(-1)![1]).toBeCloseTo(2, 4)
  })

  it('returns two coincident points when start equals end', () => {
    const out = sliceByDistance(line, total / 2, total / 2)
    expect(out).toHaveLength(2)
    expect(out[0][1]).toBeCloseTo(1, 3)
    expect(out[1]).toEqual(out[0])
  })

  it('treats reversed arguments the same as ordered ones', () => {
    const a = sliceByDistance(line, total * 0.25, total * 0.75)
    const b = sliceByDistance(line, total * 0.75, total * 0.25)
    expect(b).toEqual(a)
  })
})

describe('parseLineString', () => {
  it('returns the narrowed geometry for a valid LineString', () => {
    const geom = parseLineString({
      type: 'LineString',
      coordinates: [
        [0, 0],
        [1, 1],
      ],
    })
    expect(geom).toEqual({
      type: 'LineString',
      coordinates: [
        [0, 0],
        [1, 1],
      ],
    })
  })

  it('drops any elevation component, keeping [lng, lat]', () => {
    const geom = parseLineString({
      type: 'LineString',
      coordinates: [
        [0, 0, 100],
        [1, 1, 200],
      ],
    })
    expect(geom?.coordinates).toEqual([
      [0, 0],
      [1, 1],
    ])
  })

  it('rejects a non-LineString geometry', () => {
    expect(parseLineString({ type: 'Point', coordinates: [0, 0] })).toBeNull()
  })

  it('rejects non-array coordinates', () => {
    expect(parseLineString({ type: 'LineString', coordinates: 'nope' })).toBeNull()
  })

  it('rejects a line with fewer than two positions', () => {
    expect(
      parseLineString({ type: 'LineString', coordinates: [[0, 0]] }),
    ).toBeNull()
  })

  it('rejects non-finite coordinate values', () => {
    expect(
      parseLineString({
        type: 'LineString',
        coordinates: [
          [0, 0],
          [Number.NaN, 1],
        ],
      }),
    ).toBeNull()
  })

  it('rejects null and undefined', () => {
    expect(parseLineString(null)).toBeNull()
    expect(parseLineString(undefined)).toBeNull()
  })
})

describe('inBBox', () => {
  const bbox: [number, number, number, number] = [-1, -1, 1, 1]

  it('accepts a point inside the box', () => {
    expect(inBBox([0, 0], bbox)).toBe(true)
  })

  it('accepts a point on the boundary', () => {
    expect(inBBox([1, -1], bbox)).toBe(true)
  })

  it('rejects a point outside the box', () => {
    expect(inBBox([2, 0], bbox)).toBe(false)
  })
})
