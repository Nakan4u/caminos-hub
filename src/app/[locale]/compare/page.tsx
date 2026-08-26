import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getRoutesBySlugs } from '@/lib/routes'
import type { SearchParams } from '@/lib/filters'
import { formatKm, formatPopularity } from '@/lib/format'
import { DifficultyBadge } from '@/components/DifficultyBadge'
import styles from './compare.module.scss'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Compare' })
  return { title: t('metaTitle'), description: t('metaDescription') }
}

const MAX_COMPARE = 4

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<SearchParams>
}) {
  const { locale } = await params
  const t = await getTranslations('Compare')
  const tFormat = await getTranslations('Format')

  const raw = (await searchParams).routes
  const slugs = [
    ...new Set(
      (Array.isArray(raw) ? raw : raw ? [raw] : [])
        .flatMap((entry) => entry.split(','))
        .map((entry) => entry.trim())
        .filter(Boolean),
    ),
  ].slice(0, MAX_COMPARE)

  const routes = await getRoutesBySlugs(slugs, locale)

  if (routes.length === 0) {
    return (
      <>
        <h1 className="page-title">{t('title')}</h1>
        <p className="page-lede">{t.rich('emptyLede', { em: (chunks) => <em>{chunks}</em> })}</p>
        <Link href="/" className="btn btn-arrow mt-2">
          {t('backLink')}
        </Link>
      </>
    )
  }

  const rows: { label: string; render: (route: (typeof routes)[number]) => React.ReactNode }[] = [
    { label: t('rowDistance'), render: (route) => formatKm(route.totalKm, tFormat) },
    {
      label: t('rowTypicalDays'),
      render: (route) => tFormat('days', { days: route.typicalDays }),
    },
    {
      label: t('rowDifficulty'),
      render: (route) => <DifficultyBadge difficulty={route.difficulty} />,
    },
    { label: t('rowStarts'), render: (route) => route.startPlace },
    { label: t('rowFinishes'), render: (route) => route.endPlace },
    { label: t('rowCountries'), render: (route) => route.countries.join(', ') },
    {
      label: t('rowAverageDay'),
      render: (route) => formatKm(route.totalKm / route.typicalDays, tFormat),
    },
    { label: t('rowPilgrims'), render: (route) => formatPopularity(route.popularity, tFormat) },
    { label: t('rowBestSeason'), render: (route) => route.bestSeason },
    { label: t('rowWaymarking'), render: (route) => route.waymarking },
    {
      label: t('rowUnesco'),
      render: (route) => (route.isUnesco ? t('yes') : t('no')),
    },
  ]

  return (
    <>
      <header className="mb-4">
        <p className="eyebrow mb-2">{t('eyebrow')}</p>
        <h1 className="page-title">{t('comparingTitle', { count: routes.length })}</h1>
        {routes.length === 1 && <p className="page-lede">{t('onlyOneLede')}</p>}
      </header>

      <div className={styles.wrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col" className={styles.rowLabel}>
                <span className="visually-hidden">{t('attribute')}</span>
              </th>
              {routes.map((route) => (
                <th key={route.slug} scope="col" className={styles.routeHead}>
                  <Link href={`/routes/${route.slug}`}>{route.nameEs}</Link>
                  <span className={styles.routeHeadEn}>{route.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row" className={styles.rowLabel}>
                  {row.label}
                </th>
                {routes.map((route) => (
                  <td key={route.slug} className={styles.cell}>
                    {row.render(route)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link href="/" className="btn btn-outline-secondary mt-4">
        {t('backToAllRoutes')}
      </Link>
    </>
  )
}
