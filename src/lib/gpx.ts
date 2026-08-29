/**
 * Pure GPX 1.1 serialisation for route-track downloads. No `server-only`, no
 * dependencies — unit-tested in `src/__tests__/gpx.test.ts`.
 */

import type { LngLat } from './geo'

export interface GpxStage {
  order: number
  fromPlace: string
  toPlace: string
  /** Ordered `[lng, lat]` points for this stage; may be empty. */
  coordinates: LngLat[]
}

const ODBL_LICENSE = 'https://opendatacommons.org/licenses/odbl/'

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function fmt(n: number): string {
  return n.toFixed(6)
}

function wpt(coord: LngLat, name: string): string {
  return `  <wpt lat="${fmt(coord[1])}" lon="${fmt(coord[0])}">\n    <name>${escapeXml(name)}</name>\n  </wpt>`
}

/**
 * Serialise an ordered list of stages into a GPX document: one `<trk>` with one
 * `<trkseg>` per stage, plus a `<wpt>` for every stage boundary (the first
 * stage's start, then each stage's end).
 */
export function buildGpx({ routeName, stages }: { routeName: string; stages: GpxStage[] }): string {
  const name = escapeXml(routeName)

  const waypoints: string[] = []
  const firstWithCoords = stages.find((s) => s.coordinates.length > 0)
  if (firstWithCoords) {
    waypoints.push(wpt(firstWithCoords.coordinates[0], firstWithCoords.fromPlace))
  }
  for (const stage of stages) {
    if (stage.coordinates.length > 0) {
      waypoints.push(wpt(stage.coordinates[stage.coordinates.length - 1], stage.toPlace))
    }
  }

  const segments = stages
    .map((stage) => {
      const pts = stage.coordinates
        .map((c) => `      <trkpt lat="${fmt(c[1])}" lon="${fmt(c[0])}"></trkpt>`)
        .join('\n')
      return pts ? `    <trkseg>\n${pts}\n    </trkseg>` : '    <trkseg></trkseg>'
    })
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<gpx version="1.1" creator="caminos-hub" xmlns="http://www.topografix.com/GPX/1/1">',
    '  <metadata>',
    `    <name>${name}</name>`,
    '    <copyright author="OpenStreetMap contributors">',
    `      <license>${ODBL_LICENSE}</license>`,
    '    </copyright>',
    '  </metadata>',
    ...waypoints,
    '  <trk>',
    `    <name>${name}</name>`,
    segments,
    '  </trk>',
    '</gpx>',
    '',
  ].join('\n')
}

/** Coerce an optional 1-based stage range into a valid `{ from, to }` within `[1, stageCount]`. */
export function clampStageRange(
  from: number | undefined,
  to: number | undefined,
  stageCount: number,
): { from: number; to: number } {
  const clamp = (n: number) => Math.max(1, Math.min(stageCount, Math.round(n)))
  const lo = from != null && Number.isFinite(from) ? clamp(from) : 1
  const hi = to != null && Number.isFinite(to) ? clamp(to) : stageCount
  return lo <= hi ? { from: lo, to: hi } : { from: hi, to: lo }
}

/** Download filename: `<slug>.gpx`, or `<slug>-stages-<from>-<to>.gpx` for a partial range. */
export function gpxFilename(slug: string, from?: number, to?: number): string {
  if (from != null && to != null && Number.isFinite(from) && Number.isFinite(to)) {
    return `${slug}-stages-${from}-${to}.gpx`
  }
  return `${slug}.gpx`
}
