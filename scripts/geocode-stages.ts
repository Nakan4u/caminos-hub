/**
 * One-off: geocode every stage-boundary place name with Nominatim (OpenStreetMap)
 * and write the results into the `STAGE_COORDS` block of
 * `src/data/official-routes.ts`. Hand-verify the `git diff` afterwards and run
 * `npm test`.
 *
 *   npx tsx scripts/geocode-stages.ts [slug ...]   # limit to some routes
 *   npx tsx scripts/geocode-stages.ts --dry-run    # fetch + report, write nothing
 *   npx tsx scripts/geocode-stages.ts --force      # re-fetch names already present
 *
 * Nominatim usage policy: max 1 request/second, a real User-Agent, no bulk
 * hammering. ~170 names ≈ 3 minutes. Re-runnable — it skips names already set.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { officialRoutes } from '../src/data/official-routes'

const HERE = dirname(fileURLToPath(import.meta.url))
const DATA_FILE = join(HERE, '../src/data/official-routes.ts')
const START_MARKER = '// <geocode:start>'
const END_MARKER = '// <geocode:end>'

const LAT_RANGE = [35, 52] as const
const LNG_RANGE = [-10, 5] as const
const USER_AGENT = 'caminos-hub/1.0 (Camino route map; nakan88@gmail.com)'

const COUNTRY_CODE: Record<string, string> = {
  France: 'fr',
  Spain: 'es',
  Portugal: 'pt',
}

/** Disambiguation for names Nominatim resolves poorly from the bare string. */
const QUERY_OVERRIDES: Record<string, string> = {
  Roncesvalles: 'Roncesvalles, Navarre, Spain',
  'O Cebreiro': 'O Cebreiro, Lugo, Spain',
  Sarria: 'Sarria, Lugo, Spain',
  Melide: 'Melide, A Coruña, Spain',
  Arzúa: 'Arzúa, A Coruña, Spain',
  Redondela: 'Redondela, Pontevedra, Spain',
}

type Args = { slugs: string[]; dryRun: boolean; force: boolean }

function parseArgs(): Args {
  const argv = process.argv.slice(2)
  return {
    slugs: argv.filter((a) => !a.startsWith('--')),
    dryRun: argv.includes('--dry-run'),
    force: argv.includes('--force'),
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Distinct boundary place names, each with the country codes of the routes it appears in. */
function collectPlaces(slugs: string[]): Map<string, Set<string>> {
  const routes = slugs.length
    ? officialRoutes.filter((r) => slugs.includes(r.slug))
    : officialRoutes
  const places = new Map<string, Set<string>>()

  const add = (name: string, countries: string[]) => {
    const set = places.get(name) ?? new Set<string>()
    for (const c of countries) {
      const code = COUNTRY_CODE[c]
      if (code) set.add(code)
    }
    places.set(name, set)
  }

  for (const route of routes) {
    add(route.startPlace, route.countries)
    add(route.endPlace, route.countries)
    for (const stage of route.stages) {
      add(stage.fromPlace, route.countries)
      add(stage.toPlace, route.countries)
    }
  }
  return places
}

/** Parse the existing `'Name': [lng, lat],` entries out of the STAGE_COORDS block. */
function readExisting(source: string): Map<string, [number, number]> {
  const block = source.slice(
    source.indexOf(START_MARKER) + START_MARKER.length,
    source.indexOf(END_MARKER),
  )
  const out = new Map<string, [number, number]>()
  const re = /'((?:[^'\\]|\\.)*)':\s*\[\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\]/g
  let m: RegExpExecArray | null
  while ((m = re.exec(block))) {
    out.set(m[1].replace(/\\'/g, "'"), [Number(m[2]), Number(m[3])])
  }
  return out
}

interface GeoHit {
  lat: number
  lng: number
  displayName: string
  countryCode: string | undefined
}

async function geocode(name: string, codes: Set<string>): Promise<GeoHit | null> {
  const q = QUERY_OVERRIDES[name] ?? name
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '1')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('q', q)
  const cc = codes.size ? [...codes].join(',') : 'fr,es,pt'
  url.searchParams.set('countrycodes', cc)

  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) throw new Error(`Nominatim ${res.status} for "${q}"`)
  const body = (await res.json()) as Array<{
    lat: string
    lon: string
    display_name: string
    address?: { country_code?: string }
  }>
  if (!body.length) return null
  const hit = body[0]
  return {
    lat: Number(hit.lat),
    lng: Number(hit.lon),
    displayName: hit.display_name,
    countryCode: hit.address?.country_code,
  }
}

function plausible(hit: GeoHit): boolean {
  return (
    hit.lat >= LAT_RANGE[0] &&
    hit.lat <= LAT_RANGE[1] &&
    hit.lng >= LNG_RANGE[0] &&
    hit.lng <= LNG_RANGE[1] &&
    (hit.countryCode === undefined || ['fr', 'es', 'pt'].includes(hit.countryCode))
  )
}

function renderBlock(coords: Map<string, [number, number]>): string {
  const lines = [...coords.keys()]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => {
      const [lng, lat] = coords.get(name)!
      const key = name.replace(/'/g, "\\'")
      return `  '${key}': [${lng.toFixed(5)}, ${lat.toFixed(5)}],`
    })
  return `${START_MARKER}\n${lines.join('\n')}\n  ${END_MARKER}`
}

async function main() {
  const args = parseArgs()
  const source = readFileSync(DATA_FILE, 'utf8')
  const existing = readExisting(source)
  const places = collectPlaces(args.slugs)

  const todo = [...places.entries()].filter(
    ([name]) => args.force || !existing.has(name) || !Number.isFinite(existing.get(name)?.[0]),
  )

  console.log(
    `${places.size} distinct places; ${existing.size} already geocoded; ${todo.length} to fetch.`,
  )

  const result = new Map<string, [number, number]>(existing)
  const review: string[] = []

  for (let i = 0; i < todo.length; i += 1) {
    const [name, codes] = todo[i]
    try {
      const hit = await geocode(name, codes)
      if (!hit) {
        review.push(`NO RESULT: ${name}`)
      } else if (!plausible(hit)) {
        review.push(
          `NEEDS REVIEW: ${name} -> ${hit.lat.toFixed(5)}, ${hit.lng.toFixed(5)} (${hit.displayName})`,
        )
      } else {
        result.set(name, [hit.lng, hit.lat])
        console.log(`  ${name}: [${hit.lng.toFixed(5)}, ${hit.lat.toFixed(5)}]`)
      }
    } catch (err) {
      review.push(`ERROR: ${name} — ${(err as Error).message}`)
    }
    if (i < todo.length - 1) await sleep(1100)
  }

  if (review.length) {
    console.log('\n--- left unset, resolve by hand ---')
    for (const line of review) console.log(line)
  }

  if (args.dryRun) {
    console.log('\n--dry-run: not writing.')
    return
  }

  const before = source.indexOf(START_MARKER)
  const after = source.indexOf(END_MARKER) + END_MARKER.length
  const next = source.slice(0, before) + renderBlock(result) + source.slice(after)
  writeFileSync(DATA_FILE, next)
  console.log(`\nWrote ${result.size} entries to ${DATA_FILE}. Review the diff, then: npm test`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
