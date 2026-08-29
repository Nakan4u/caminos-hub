import 'dotenv/config'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import { officialRoutes } from '../src/data/official-routes'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set — copy .env.example to .env')
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

const TRACKS_DIR = join(dirname(fileURLToPath(import.meta.url)), '../src/data/tracks')

interface TrackFeature {
  geometry: { type: string; coordinates: [number, number][] }
  properties: { stageOrder: number }
}

/** Load `src/data/tracks/<slug>.geojson`, if present, as `stageOrder → LineString`. */
function loadTrack(slug: string): Map<number, TrackFeature['geometry']> {
  const path = join(TRACKS_DIR, `${slug}.geojson`)
  const byOrder = new Map<number, TrackFeature['geometry']>()
  if (!existsSync(path)) return byOrder

  const fc = JSON.parse(readFileSync(path, 'utf8')) as { features: TrackFeature[] }
  for (const feature of fc.features) {
    if (feature.geometry?.type === 'LineString' && feature.geometry.coordinates.length >= 2) {
      byOrder.set(feature.properties.stageOrder, feature.geometry)
    }
  }
  return byOrder
}

async function main() {
  // Stages (and their StageTrack rows) cascade from Route, so clearing routes clears everything.
  await prisma.route.deleteMany()

  let trackCount = 0

  for (const { stages, translations, name, summary, description, startPlace, endPlace, waymarking, bestSeason, ...route } of officialRoutes) {
    const created = await prisma.route.create({
      data: {
        ...route,
        translations: {
          create: [
            { locale: 'en', name, summary, description, startPlace, endPlace, waymarking, bestSeason },
            ...(translations?.uk ? [{ locale: 'uk', ...translations.uk }] : []),
          ],
        },
        stages: {
          create: stages.map((stage, index) => ({ ...stage, order: index + 1 })),
        },
      },
      include: { stages: true },
    })

    const track = loadTrack(route.slug)
    if (track.size > 0) {
      const rows = created.stages
        .filter((stage) => track.has(stage.order))
        .map((stage) => ({ stageId: stage.id, geometry: track.get(stage.order)! }))
      await prisma.stageTrack.createMany({ data: rows })
      trackCount += rows.length
      if (rows.length !== created.stages.length) {
        console.warn(`  ${route.slug}: ${rows.length}/${created.stages.length} stages have track geometry`)
      }
    }
  }

  const routeCount = await prisma.route.count()
  const stageCount = await prisma.stage.count()
  console.log(
    `Seeded ${routeCount} official routes, ${stageCount} stages, ${trackCount} stage tracks.`,
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
