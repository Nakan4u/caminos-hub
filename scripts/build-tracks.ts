/**
 * One-off: fetch each Camino's route geometry from OpenStreetMap (Overpass),
 * stitch the member ways into one ordered polyline, cut it into one LineString
 * per stage at the geocoded stage boundaries, and write
 * `src/data/tracks/<slug>.geojson` (a FeatureCollection, one Feature per stage).
 *
 *   npx tsx scripts/build-tracks.ts                 # every route with a relation id
 *   npx tsx scripts/build-tracks.ts camino-frances  # just these
 *
 * Routes with no entry in OSM_RELATIONS (or a failed stitch) are skipped and fall
 * back at runtime to a straight line between stage markers. Verify output by
 * opening the .geojson files on https://geojson.io before committing.
 *
 * OSM data is ODbL — the map and exported GPX keep "© OpenStreetMap contributors".
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { officialRoutes } from '../src/data/official-routes'
import {
  haversineMeters,
  nearestOnPolyline,
  polylineLengthMeters,
  sliceByDistance,
  type LngLat,
} from '../src/lib/geo'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(HERE, '../src/data/tracks')
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]
const USER_AGENT = 'caminos-hub/1.0 (Camino route map; nakan88@gmail.com)'
/** Endpoint-match tolerance when chaining ways, in metres. */
const STITCH_EPS_M = 30
/**
 * If a stage boundary sits further than this from the stitched OSM line, the
 * relation almost certainly doesn't cover that part of the route — drop the
 * stage's geometry so it falls back to a straight line at runtime.
 */
const MAX_SNAP_M = 4000
/** Skip a route's file entirely if fewer than this fraction of stages survive. */
const MIN_STAGE_COVERAGE = 0.5

/**
 * slug -> OSM route-relation id(s). Curated by hand from openstreetmap.org; each
 * line links the relation it came from. A super-relation is given as an array of
 * its sub-relation ids (or its own id — the query walks one level of children).
 * Absent slug => skipped => runtime straight-line fallback.
 */
const OSM_RELATIONS: Record<string, number | number[]> = {
  // Candidates from openstreetmap.org. OSM's Camino coverage is uneven: some
  // routes are one clean relation, others are a chain of segment relations with
  // gaps, and several have nothing usable. Anything missing or partial falls back
  // to straight lines between stage markers at runtime. Verify each generated
  // .geojson on https://geojson.io before trusting it.

  // Segments 01, 03, 04, 06, 07 (02/05 unused numbers; the final Palas de Rei →
  // Santiago leg has no relation and will fall back).
  // https://www.openstreetmap.org/relation/2163569
  'camino-frances': [2163569, 2163558, 2163560, 2163561, 2163565],
  // https://www.openstreetmap.org/relation/385098  (Santiago → Fisterra / Muxía)
  'camino-fisterra-muxia': 385098,
  // https://www.openstreetmap.org/relation/2661682
  'camino-del-salvador': 2661682,
  // https://www.openstreetmap.org/relation/7340035
  'camino-lebaniego': 7340035,
  // https://www.openstreetmap.org/relation/1868399  (Camiño de Inverno)
  'camino-de-invierno': 1868399,
  // https://www.openstreetmap.org/relation/8099566  (Camiño Portugués da Costa)
  'camino-portugues-costa': 8099566,
  // Sevilla → Mérida → Salamanca → Astorga (Sanabrés continuation not included).
  // https://www.openstreetmap.org/relation/16949978
  'via-de-la-plata': [16949978, 16949977, 16949976],
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

interface OsmWay {
  type: 'way'
  id: number
  geometry?: { lat: number; lon: number }[]
}
interface OsmRelation {
  type: 'relation'
  id: number
  members: { type: string; ref: number; role: string }[]
}
type OsmElement = OsmWay | OsmRelation

async function overpass(query: string): Promise<OsmElement[]> {
  let lastErr: unknown
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': USER_AGENT },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(180_000),
      })
      if (!res.ok) throw new Error(`Overpass ${res.status}`)
      const body = (await res.json()) as { elements: OsmElement[] }
      return body.elements
    } catch (err) {
      lastErr = err
      console.warn(`  ${endpoint} failed (${(err as Error).message}), trying next…`)
    }
  }
  throw lastErr
}

function relationQuery(ids: number[]): string {
  const set = ids.join(',')
  return [
    '[out:json][timeout:300];',
    `rel(id:${set});`,
    'out body;',
    'way(r);',
    'out geom;',
    'rel(r);',
    'out body;',
    'way(r);',
    'out geom;',
  ].join('\n')
}

/** Member ways to use: role "" or "forward"/"main"/"route"; drop backward/alternates. */
const USE_ROLES = new Set(['', 'forward', 'main', 'route'])

function orderedWayIds(relations: OsmRelation[]): number[] {
  const ids: number[] = []
  const seen = new Set<number>()
  for (const rel of relations) {
    for (const m of rel.members) {
      if (m.type === 'way' && USE_ROLES.has(m.role) && !seen.has(m.ref)) {
        seen.add(m.ref)
        ids.push(m.ref)
      }
    }
  }
  return ids
}

function endpointsClose(a: LngLat, b: LngLat): boolean {
  return haversineMeters(a, b) <= STITCH_EPS_M
}

/** Greedy-chain way polylines into one ordered master polyline; insert straight connectors across gaps. */
function stitch(ways: LngLat[][]): { line: LngLat[]; gaps: number[] } {
  const pool = ways.filter((w) => w.length >= 2)
  if (!pool.length) return { line: [], gaps: [] }

  let chain = pool.shift()!.slice()
  const gaps: number[] = []

  while (pool.length) {
    const head = chain[0]
    const tail = chain[chain.length - 1]
    let bestIdx = -1
    let bestKind: 'tail' | 'tail-rev' | 'head' | 'head-rev' = 'tail'
    let bestDist = Infinity

    pool.forEach((w, i) => {
      const ws = w[0]
      const we = w[w.length - 1]
      const cand: [number, typeof bestKind][] = [
        [haversineMeters(tail, ws), 'tail'],
        [haversineMeters(tail, we), 'tail-rev'],
        [haversineMeters(head, we), 'head'],
        [haversineMeters(head, ws), 'head-rev'],
      ]
      for (const [d, kind] of cand) {
        if (d < bestDist) {
          bestDist = d
          bestIdx = i
          bestKind = kind
        }
      }
    })

    const [next] = pool.splice(bestIdx, 1)
    const forward = next
    const reversed = [...next].reverse()
    if (bestKind === 'tail' || bestKind === 'tail-rev') {
      const seg = bestKind === 'tail' ? forward : reversed
      if (!endpointsClose(tail, seg[0])) gaps.push(bestDist)
      chain = chain.concat(seg.slice(1))
    } else {
      const seg = bestKind === 'head' ? forward : reversed
      if (!endpointsClose(head, seg[seg.length - 1])) gaps.push(bestDist)
      chain = seg.slice(0, -1).concat(chain)
    }
  }
  return { line: chain, gaps }
}

interface StageFeature {
  type: 'Feature'
  geometry: { type: 'LineString'; coordinates: LngLat[] }
  properties: { stageOrder: number; fromPlace: string; toPlace: string; snapDistM: number }
}

function boundaryCoords(route: (typeof officialRoutes)[number]): (LngLat | null)[] {
  const first = route.stages[0]
  const bounds: (LngLat | null)[] = [
    first.fromLng != null && first.fromLat != null ? [first.fromLng, first.fromLat] : null,
  ]
  for (const s of route.stages) {
    bounds.push(s.toLng != null && s.toLat != null ? [s.toLng, s.toLat] : null)
  }
  return bounds
}

async function buildRoute(route: (typeof officialRoutes)[number]): Promise<void> {
  const relSpec = OSM_RELATIONS[route.slug]
  if (relSpec == null) {
    console.log(`${route.slug}: no OSM relation — skipping (runtime fallback).`)
    return
  }
  const ids = Array.isArray(relSpec) ? relSpec : [relSpec]
  console.log(`${route.slug}: fetching relation ${ids.join(', ')}…`)

  const elements = await overpass(relationQuery(ids))
  const relations = elements.filter((e): e is OsmRelation => e.type === 'relation')
  const waysById = new Map<number, LngLat[]>()
  for (const el of elements) {
    if (el.type === 'way' && el.geometry) {
      waysById.set(
        el.id,
        el.geometry.map((p) => [p.lon, p.lat] as LngLat),
      )
    }
  }

  const wayIds = orderedWayIds(relations)
  const ways = wayIds.map((id) => waysById.get(id)).filter((w): w is LngLat[] => w != null && w.length >= 2)
  if (ways.length < 2) {
    console.warn(`  only ${ways.length} usable ways — skipping (runtime fallback).`)
    return
  }

  const { line: master, gaps } = stitch(ways)
  const masterLen = polylineLengthMeters(master)
  console.log(
    `  stitched ${ways.length} ways -> ${master.length} pts, ${(masterLen / 1000).toFixed(1)} km` +
      (gaps.length ? `, ${gaps.length} gap(s) up to ${Math.max(...gaps).toFixed(0)} m` : ''),
  )

  // Orient the master line so it runs start-of-route -> end-of-route.
  const bounds = boundaryCoords(route)
  const startB = bounds[0]
  const endB = bounds[bounds.length - 1]
  if (startB && endB) {
    const dStart = haversineMeters(master[0], startB)
    const dEnd = haversineMeters(master[0], endB)
    if (dEnd < dStart) master.reverse()
  }

  const projected = bounds.map((b) => (b ? nearestOnPolyline(master, b) : null))

  // Enforce monotonic distance-along; clamp regressions.
  let prev = 0
  const dist = projected.map((p) => {
    if (!p) return prev
    const d = Math.max(prev, p.distAlongMeters)
    if (p.distAlongMeters < prev - 1) {
      console.warn(`  boundary regressed along track — clamping (${p.distAlongMeters.toFixed(0)} < ${prev.toFixed(0)})`)
    }
    prev = d
    return d
  })

  const features: StageFeature[] = []
  let dropped = 0
  route.stages.forEach((stage, i) => {
    const stageOrder = i + 1
    const slice = sliceByDistance(master, dist[i], dist[i + 1])
    const pa = projected[i]
    const pb = projected[i + 1]
    if (pa) slice[0] = pa.point
    if (pb) slice[slice.length - 1] = pb.point
    const snapDistM = Math.max(pa?.distToLineMeters ?? 0, pb?.distToLineMeters ?? 0)

    if (snapDistM > MAX_SNAP_M || slice.length < 2) {
      dropped += 1
      console.warn(
        `  stage ${stageOrder} (${stage.fromPlace}->${stage.toPlace}): snap ${snapDistM.toFixed(0)} m — dropped, will fall back`,
      )
      return
    }
    features.push({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: slice },
      properties: {
        stageOrder,
        fromPlace: stage.fromPlace,
        toPlace: stage.toPlace,
        snapDistM: Math.round(snapDistM),
      },
    })
  })

  if (features.length < route.stages.length * MIN_STAGE_COVERAGE) {
    console.warn(
      `  only ${features.length}/${route.stages.length} stages usable — skipping route (runtime fallback).`,
    )
    return
  }

  mkdirSync(OUT_DIR, { recursive: true })
  const fc = { type: 'FeatureCollection', features }
  writeFileSync(join(OUT_DIR, `${route.slug}.geojson`), `${JSON.stringify(fc, null, 1)}\n`)
  console.log(
    `  wrote src/data/tracks/${route.slug}.geojson (${features.length}/${route.stages.length} stages` +
      (dropped ? `, ${dropped} dropped` : '') +
      ')',
  )
}

async function main() {
  const slugs = process.argv.slice(2).filter((a) => !a.startsWith('--'))
  const routes = slugs.length
    ? officialRoutes.filter((r) => slugs.includes(r.slug))
    : officialRoutes

  for (let i = 0; i < routes.length; i += 1) {
    try {
      await buildRoute(routes[i])
    } catch (err) {
      console.error(`${routes[i].slug}: ${(err as Error).message} — skipping (runtime fallback).`)
    }
    if (i < routes.length - 1) await sleep(2000)
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
