/**
 * Pure assembly and slicing of per-stage route geometry, plus the view-model
 * mappers the map island and API routes share. No `server-only`, no dependencies
 * — unit-tested in `src/__tests__/track.test.ts`.
 *
 * Operates only on data already loaded elsewhere; nothing here touches the DB.
 */

import type { LngLat } from './geo'
import type { GpxStage } from './gpx'

export interface StageGeom {
  order: number
  fromPlace: string
  toPlace: string
  from: LngLat | null
  to: LngLat | null
  /** Real trail geometry for this stage, or `null` when OSM had none. */
  geometry: { coordinates: LngLat[] } | null
}

const EPS = 1e-7

function samePoint(a: LngLat, b: LngLat): boolean {
  return Math.abs(a[0] - b[0]) < EPS && Math.abs(a[1] - b[1]) < EPS
}

/**
 * The drawable line for a stage: its real geometry, or a straight from→to line
 * when geometry is missing, or `[]` when neither is available.
 */
export function stageLine(s: StageGeom): LngLat[] {
  if (s.geometry && s.geometry.coordinates.length >= 2) return s.geometry.coordinates
  if (s.from && s.to) return [s.from, s.to]
  return []
}

export interface AssembledRange {
  /** All stage lines in the range concatenated, shared boundary vertices de-duplicated. */
  coordinates: LngLat[]
  /** One entry per in-range stage, for GPX `<trkseg>` output. */
  segments: GpxStage[]
  /** True when any in-range stage fell back to a straight line. */
  usedFallback: boolean
}

/** Assemble the stages whose `order` is within `[fromOrder, toOrder]` into one track. */
export function assembleRange(
  stages: StageGeom[],
  fromOrder: number,
  toOrder: number,
): AssembledRange {
  const inRange = stages
    .filter((s) => s.order >= fromOrder && s.order <= toOrder)
    .sort((a, b) => a.order - b.order)

  const coordinates: LngLat[] = []
  const segments: GpxStage[] = []
  let usedFallback = false

  for (const stage of inRange) {
    const line = stageLine(stage)
    if (!stage.geometry) usedFallback = true

    segments.push({
      order: stage.order,
      fromPlace: stage.fromPlace,
      toPlace: stage.toPlace,
      coordinates: line,
    })

    for (const point of line) {
      const last = coordinates[coordinates.length - 1]
      if (last && samePoint(last, point)) continue
      coordinates.push(point)
    }
  }

  return { coordinates, segments, usedFallback }
}

/** Leaflet-style bounds `[[south, west], [north, east]]` over every known stage endpoint, or `null`. */
export function routeBounds(
  stages: StageGeom[],
): [[number, number], [number, number]] | null {
  const points = stages.flatMap((s) => [s.from, s.to]).filter((p): p is LngLat => p != null)
  if (points.length === 0) return null

  let minLat = Infinity
  let minLng = Infinity
  let maxLat = -Infinity
  let maxLng = -Infinity
  for (const [lng, lat] of points) {
    if (lat < minLat) minLat = lat
    if (lat > maxLat) maxLat = lat
    if (lng < minLng) minLng = lng
    if (lng > maxLng) maxLng = lng
  }
  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ]
}

/** Whether any stage carries a usable start coordinate (drives the "show the map" guard). */
export function routeHasCoords(
  stages: { fromLat?: number | null; fromLng?: number | null }[],
): boolean {
  return stages.some(
    (s) =>
      s.fromLat != null &&
      s.fromLng != null &&
      Number.isFinite(s.fromLat) &&
      Number.isFinite(s.fromLng),
  )
}

/** GeoJSON FeatureCollection: one LineString per drawable stage, tagged with stage metadata. */
export function toFeatureCollection(stages: StageGeom[]): unknown {
  const features = stages
    .map((stage) => {
      const line = stageLine(stage)
      if (line.length < 2) return null
      return {
        type: 'Feature' as const,
        geometry: { type: 'LineString' as const, coordinates: line },
        properties: {
          stageOrder: stage.order,
          fromPlace: stage.fromPlace,
          toPlace: stage.toPlace,
          fallback: stage.geometry == null,
        },
      }
    })
    .filter((f) => f != null)

  return { type: 'FeatureCollection', features }
}

export interface MapStageRow {
  order: number
  fromPlace: string
  toPlace: string
  fromLat: number | null
  fromLng: number | null
  toLat: number | null
  toLng: number | null
}

export interface MapStage {
  order: number
  fromPlace: string
  toPlace: string
  from: LngLat | null
  to: LngLat | null
}

function pair(lng: number | null, lat: number | null): LngLat | null {
  if (lng == null || lat == null) return null
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null
  return [lng, lat]
}

/** Project the four nullable coordinate columns of each stage row into `[lng, lat]` pairs. */
export function toMapStages(stages: MapStageRow[]): MapStage[] {
  return stages.map((s) => ({
    order: s.order,
    fromPlace: s.fromPlace,
    toPlace: s.toPlace,
    from: pair(s.fromLng, s.fromLat),
    to: pair(s.toLng, s.toLat),
  }))
}
