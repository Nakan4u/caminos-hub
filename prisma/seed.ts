import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import { officialRoutes } from '../src/data/official-routes'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set — copy .env.example to .env')
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

async function main() {
  // Stages cascade from Route, so clearing routes clears everything.
  await prisma.route.deleteMany()

  for (const { stages, translations, name, summary, description, startPlace, endPlace, waymarking, bestSeason, ...route } of officialRoutes) {
    await prisma.route.create({
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
    })
  }

  const routeCount = await prisma.route.count()
  const stageCount = await prisma.stage.count()
  console.log(`Seeded ${routeCount} official routes and ${stageCount} stages.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
