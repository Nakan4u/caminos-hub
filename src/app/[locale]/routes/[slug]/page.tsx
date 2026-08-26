import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getRouteBySlug } from '@/lib/routes'
import { formatPopularity } from '@/lib/format'
import { DifficultyBadge } from '@/components/DifficultyBadge'
import { StageTable } from '@/components/StageTable'
import styles from './route-detail.module.scss'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const route = await getRouteBySlug(slug, locale)
  if (!route) {
    const t = await getTranslations({ locale, namespace: 'RouteDetail' })
    return { title: t('notFoundTitle') }
  }
  return { title: route.nameEs, description: route.summary }
}

export default async function RouteDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const route = await getRouteBySlug(slug, locale)
  if (!route) notFound()

  const t = await getTranslations('RouteDetail')
  const tFormat = await getTranslations('Format')
  const tDifficulty = await getTranslations('Difficulty')

  const longestStage = route.stages.reduce((longest, stage) =>
    stage.distanceKm > longest.distanceKm ? stage : longest,
  )
  const averageKm = route.totalKm / route.stages.length

  const facts = [
    { label: t('factTotalDistance'), value: tFormat('km', { km: route.totalKm }) },
    {
      label: t('factTypicalDuration'),
      value: tFormat('days', { days: route.typicalDays }),
    },
    { label: t('factStages'), value: String(route.stages.length) },
    {
      label: t('factAverageStage'),
      value: tFormat('km', { km: averageKm.toFixed(1) }),
    },
    {
      label: t('factLongestStage'),
      value: tFormat('km', { km: longestStage.distanceKm.toFixed(1) }),
    },
    { label: t('factPilgrims'), value: formatPopularity(route.popularity, tFormat) },
  ]

  return (
    <article>
      <Link href="/" className={styles.back}>
        {t('backLink')}
      </Link>

      <header className={styles.header}>
        <div>
          <p className="eyebrow mb-2">
            {route.countries.join(' · ')}
            {route.isUnesco && ` · ${t('unesco')}`}
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
            <h2 className={styles.asideHeading}>{t('beforeYouGo')}</h2>
            <dl className="mb-0">
              <dt className={styles.asideLabel}>{t('difficulty')}</dt>
              <dd className={styles.asideValue}>
                {tDifficulty(`${route.difficulty}.label`)} —{' '}
                {tDifficulty(`${route.difficulty}.blurb`)}
              </dd>
              <dt className={styles.asideLabel}>{t('waymarking')}</dt>
              <dd className={styles.asideValue}>{route.waymarking}</dd>
              <dt className={styles.asideLabel}>{t('bestSeason')}</dt>
              <dd className={`${styles.asideValue} mb-0`}>{route.bestSeason}</dd>
            </dl>
          </aside>
        </div>
      </div>

      <section className="mt-5">
        <h2 className={styles.sectionHeading}>{t('stagesHeading')}</h2>
        <p className="text-secondary small mb-3">{t('stagesIntro')}</p>
        <StageTable stages={route.stages} />
      </section>
    </article>
  )
}
