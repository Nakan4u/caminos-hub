/**
 * Small, pure geo helpers for building and slicing route tracks. No `server-only`,
 * no dependencies — everything here is unit-tested in `src/__tests__/geo.test.ts`.
 *
 * Coordinates are GeoJSON order: `[longitude, latitude]`.
 */

export type LngLat = [number, number]

const EARTH_RADIUS_M = 6_371_000
const DEG_TO_RAD = Math.PI / 180
/** Metres per degree of latitude (constant on a sphere). */
const METERS_PER_DEG_LAT = EARTH_RADIUS_M * DEG_TO_RAD

/** Great-circle distance between two `[lng, lat]` points, in metres. */
export function haversineMeters(a: LngLat, b: LngLat): number {
  if (a[0] === b[0] && a[1] === b[1]) return 0
  const lat1 = a[1] * DEG_TO_RAD
  const lat2 = b[1] * DEG_TO_RAD
  const dLat = lat2 - lat1
  const dLng = (b[0] - a[0]) * DEG_TO_RAD
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Cumulative distance to each vertex; `result[0]` is always `0`. */
export function cumulativeMeters(line: LngLat[]): number[] {
  const out = [0]
  for (let i = 1; i < line.length; i += 1) {
    out.push(out[i - 1] + haversineMeters(line[i - 1], line[i]))
  }
  return out
}

/** Total length of a polyline, in metres. */
export function polylineLengthMeters(line: LngLat[]): number {
  const cum = cumulativeMeters(line)
  return cum[cum.length - 1] ?? 0
}

/** Metres per degree of longitude at a given latitude. */
function metersPerDegLng(latDeg: number): number {
  return METERS_PER_DEG_LAT * Math.cos(latDeg * DEG_TO_RAD)
}

export interface NearestResult {
  /** The closest point on the polyline, as `[lng, lat]`. */
  point: LngLat
  /** Index of the segment (`line[segIndex] → line[segIndex + 1]`) the point lies on. */
  segIndex: number
  /** Distance from the start of the line to `point`, along the line, in metres. */
  distAlongMeters: number
  /** Perpendicular distance from the query point to the line, in metres. */
  distToLineMeters: number
}

/**
 * Nearest point on `line` to `p`, using a local equirectangular projection
 * centred on `p`'s latitude — accurate at the scale of a single Camino stage.
 */
export function nearestOnPolyline(line: LngLat[], p: LngLat): NearestResult {
  const mx = metersPerDegLng(p[1])
  const my = METERS_PER_DEG_LAT
  const px = p[0] * mx
  const py = p[1] * my

  const cum = cumulativeMeters(line)
  let best: NearestResult | null = null

  for (let i = 0; i < line.length - 1; i += 1) {
    const a = line[i]
    const b = line[i + 1]
    const ax = a[0] * mx
    const ay = a[1] * my
    const bx = b[0] * mx
    const by = b[1] * my
    const dx = bx - ax
    const dy = by - ay
    const lenSq = dx * dx + dy * dy
    const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq))
    const fx = ax + t * dx
    const fy = ay + t * dy
    const distToLine = Math.hypot(px - fx, py - fy)

    if (!best || distToLine < best.distToLineMeters) {
      const segLen = haversineMeters(a, b)
      best = {
        point: [fx / mx, fy / my],
        segIndex: i,
        distAlongMeters: cum[i] + t * segLen,
        distToLineMeters: distToLine,
      }
    }
  }

  if (!best) {
    // Degenerate line (0 or 1 vertices): the query point maps to the only vertex.
    const only = line[0] ?? p
    return { point: only, segIndex: 0, distAlongMeters: 0, distToLineMeters: haversineMeters(only, p) }
  }
  return best
}

/** Linear interpolation between two `[lng, lat]` points. */
function lerp(a: LngLat, b: LngLat, t: number): LngLat {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
}

/**
 * The sub-polyline between two distances measured along `line`, in metres.
 * Distances are clamped to `[0, length]` and swapped if given out of order.
 * Always returns at least two points (two coincident points when `start === end`).
 */
export function sliceByDistance(line: LngLat[], startM: number, endM: number): LngLat[] {
  if (line.length < 2) return line.length === 1 ? [line[0], line[0]] : []

  const cum = cumulativeMeters(line)
  const total = cum[cum.length - 1]
  const lo = Math.max(0, Math.min(total, Math.min(startM, endM)))
  const hi = Math.max(0, Math.min(total, Math.max(startM, endM)))

  const pointAt = (dist: number): LngLat => {
    if (dist <= 0) return [...line[0]] as LngLat
    if (dist >= total) return [...line[line.length - 1]] as LngLat
    let seg = 1
    while (seg < cum.length && cum[seg] < dist) seg += 1
    const segStart = cum[seg - 1]
    const segLen = cum[seg] - segStart
    const t = segLen === 0 ? 0 : (dist - segStart) / segLen
    return lerp(line[seg - 1], line[seg], t)
  }

  const out: LngLat[] = [pointAt(lo)]
  for (let i = 0; i < line.length; i += 1) {
    if (cum[i] > lo && cum[i] < hi) out.push([...line[i]] as LngLat)
  }
  out.push(pointAt(hi))
  return out
}

export interface ParsedLineString {
  type: 'LineString'
  coordinates: LngLat[]
}

/** Narrows an unknown value (e.g. a Prisma `Json` column) to a GeoJSON LineString, or `null`. */
export function parseLineString(v: unknown): ParsedLineString | null {
  if (!v || typeof v !== 'object') return null
  const geom = v as { type?: unknown; coordinates?: unknown }
  if (geom.type !== 'LineString' || !Array.isArray(geom.coordinates)) return null
  if (geom.coordinates.length < 2) return null

  const coordinates: LngLat[] = []
  for (const pos of geom.coordinates) {
    if (!Array.isArray(pos) || pos.length < 2) return null
    const lng = pos[0]
    const lat = pos[1]
    if (typeof lng !== 'number' || typeof lat !== 'number') return null
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null
    coordinates.push([lng, lat])
  }
  return { type: 'LineString', coordinates }
}

/** Whether `p` falls within `bbox` (`[minLng, minLat, maxLng, maxLat]`), boundary inclusive. */
export function inBBox(p: LngLat, bbox: [number, number, number, number]): boolean {
  return p[0] >= bbox[0] && p[0] <= bbox[2] && p[1] >= bbox[1] && p[1] <= bbox[3]
}
