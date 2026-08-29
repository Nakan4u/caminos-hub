import { describe, expect, it } from 'vitest'
import { buildGpx, clampStageRange, gpxFilename, type GpxStage } from '@/lib/gpx'

const stages: GpxStage[] = [
  {
    order: 1,
    fromPlace: 'Sarria',
    toPlace: 'Portomarín',
    coordinates: [
      [-7.414, 42.781],
      [-7.5, 42.8],
      [-7.616, 42.807],
    ],
  },
  {
    order: 2,
    fromPlace: 'Portomarín',
    toPlace: 'Palas de Rei',
    coordinates: [
      [-7.616, 42.807],
      [-7.7, 42.85],
      [-7.869, 42.873],
    ],
  },
]

function count(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1
}

describe('buildGpx', () => {
  it('emits a GPX 1.1 document', () => {
    const xml = buildGpx({ routeName: 'Camino Francés', stages })
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toContain('<gpx version="1.1"')
    expect(xml).toContain('http://www.topografix.com/GPX/1/1')
  })

  it('writes one track segment per stage', () => {
    const xml = buildGpx({ routeName: 'r', stages })
    expect(count(xml, '<trkseg>')).toBe(2)
    expect(count(xml, '</trkseg>')).toBe(2)
  })

  it('writes one boundary waypoint per stage plus the very first start', () => {
    const xml = buildGpx({ routeName: 'r', stages })
    expect(count(xml, '<wpt ')).toBe(stages.length + 1)
    expect(xml).toContain('<name>Sarria</name>')
    expect(xml).toContain('<name>Palas de Rei</name>')
  })

  it('writes the first and last trackpoints from the stage coordinates', () => {
    const xml = buildGpx({ routeName: 'r', stages })
    expect(xml).toContain('<trkpt lat="42.781000" lon="-7.414000">')
    expect(xml).toContain('<trkpt lat="42.873000" lon="-7.869000">')
  })

  it('includes an ODbL copyright for the OSM-derived geometry', () => {
    const xml = buildGpx({ routeName: 'r', stages })
    expect(xml).toContain('OpenStreetMap contributors')
    expect(xml).toContain('opendatacommons.org/licenses/odbl')
  })

  it('XML-escapes text content', () => {
    const xml = buildGpx({
      routeName: 'A & B <"x">',
      stages: [{ order: 1, fromPlace: "O'Neill", toPlace: 'Z', coordinates: [[0, 0], [1, 1]] }],
    })
    expect(xml).toContain('A &amp; B &lt;&quot;x&quot;&gt;')
    expect(xml).toContain('O&apos;Neill')
    expect(xml).not.toContain('A & B <"x">')
  })

  it('produces balanced container tags', () => {
    const xml = buildGpx({ routeName: 'r', stages })
    for (const tag of ['gpx', 'metadata', 'trk']) {
      expect(count(xml, `<${tag}>`) + count(xml, `<${tag} `)).toBe(count(xml, `</${tag}>`))
    }
  })

  it('tolerates a stage with no coordinates', () => {
    const xml = buildGpx({
      routeName: 'r',
      stages: [{ order: 1, fromPlace: 'A', toPlace: 'B', coordinates: [] }],
    })
    expect(count(xml, '<trkseg>')).toBe(1)
    expect(count(xml, '<trkpt ')).toBe(0)
  })
})

describe('clampStageRange', () => {
  it('defaults an unspecified range to the whole route', () => {
    expect(clampStageRange(undefined, undefined, 33)).toEqual({ from: 1, to: 33 })
  })

  it('orders a reversed range', () => {
    expect(clampStageRange(9, 5, 33)).toEqual({ from: 5, to: 9 })
  })

  it('clamps out-of-bounds values into [1, stageCount]', () => {
    expect(clampStageRange(0, 99, 33)).toEqual({ from: 1, to: 33 })
  })

  it('treats NaN as unspecified', () => {
    expect(clampStageRange(Number.NaN, Number.NaN, 10)).toEqual({ from: 1, to: 10 })
  })
})

describe('gpxFilename', () => {
  it('names a whole-route download after the slug', () => {
    expect(gpxFilename('camino-frances')).toBe('camino-frances.gpx')
  })

  it('names a partial download with its stage range', () => {
    expect(gpxFilename('camino-frances', 5, 9)).toBe('camino-frances-stages-5-9.gpx')
  })

  it('falls back to the whole-route name when a bound is missing', () => {
    expect(gpxFilename('camino-frances', 5)).toBe('camino-frances.gpx')
  })
})
