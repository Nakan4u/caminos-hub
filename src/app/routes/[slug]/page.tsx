import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getRouteBySlug } from '@/lib/routes'
import { DIFFICULTY_BLURBS, DIFFICULTY_LABELS, formatPopularity } from '@/lib/format'
import { DifficultyBadge } from '@/components/DifficultyBadge'
import { StageTable } from '@/components/StageTable'
import styles from './route-detail.module.scss'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const route = await getRouteBySlug((await params).slug)
  if (!route) return { title: 'Route not found' }
  return { title: route.nameEs, description: route.summary }
}

export default async function RouteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const route = await getRouteBySlug((await params).slug)
  if (!route) notFound()

  const longestStage = route.stages.reduce((longest, stage) =>
    stage.distanceKm > longest.distanceKm ? stage : longest,
  )
  const averageKm = route.totalKm / route.stages.length

  const facts = [
    { label: 'Total distance', value: `${route.totalKm} km` },
    { label: 'Typical duration', value: `${route.typicalDays} days` },
    { label: 'Stages', value: String(route.stages.length) },
    { label: 'Average stage', value: `${averageKm.toFixed(1)} km` },
    { label: 'Longest stage', value: `${longestStage.distanceKm.toFixed(1)} km` },
    { label: 'Pilgrims', value: formatPopularity(route.popularity) },
  ]

  return (
    <article>
      <Link href="/" className={styles.back}>
        ← All routes
      </Link>

      <header className={styles.header}>
        <div>
          <p className="eyebrow mb-2">
            {route.countries.join(' · ')}
            {route.isUnesco && ' · UNESCO World Heritage'}
          </p>
          <h1 className="page-title mb-1">{route.nameEs}</h1>
          <p className={styles.nameEn}>{route.name}</p>
          <p className={styles.endpoints}>
            {route.startPlace} <span className={styles.arrow}>→</span> {route.endPlace}
          </p>
        </div>
        <DifficultyBadge difficulty={route.difficulty} />
      </header>

      <dl className={styles.facts}>
        {facts.map((fact) => (
          <div key={fact.label} className={styles.fact}>
            <dt className={styles.factLabel}>{fact.label}</dt>
            <dd className={styles.factValue}>{fact.value}</dd>
          </div>
        ))}
      </dl>

      <div className="row g-4 mt-1">
        <div className="col-12 col-lg-8">
          {route.description.split('\n\n').map((paragraph, index) => (
            <p key={index} className={styles.prose}>
              {paragraph}
            </p>
          ))}
        </div>
        <div className="col-12 col-lg-4">
          <aside className={styles.aside}>
            <h2 className={styles.asideHeading}>Before you go</h2>
            <dl className="mb-0">
              <dt className={styles.asideLabel}>Difficulty</dt>
              <dd className={styles.asideValue}>
                {DIFFICULTY_LABELS[route.difficulty]} —{' '}
                {DIFFICULTY_BLURBS[route.difficulty]}
              </dd>
              <dt className={styles.asideLabel}>Waymarking</dt>
              <dd className={styles.asideValue}>{route.waymarking}</dd>
              <dt className={styles.asideLabel}>Best season</dt>
              <dd className={`${styles.asideValue} mb-0`}>{route.bestSeason}</dd>
            </dl>
          </aside>
        </div>
      </div>

      <section className="mt-5">
        <h2 className={styles.sectionHeading}>Stages</h2>
        <p className="text-secondary small mb-3">
          The conventional stage division. Distances over 30 km are highlighted — those
          are the days worth planning around.
        </p>
        <StageTable stages={route.stages} />
      </section>
    </article>
  )
}
