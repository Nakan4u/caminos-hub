import type { Metadata } from 'next'
import Link from 'next/link'
import { getRoutesBySlugs } from '@/lib/routes'
import type { SearchParams } from '@/lib/filters'
import { formatPopularity } from '@/lib/format'
import { DifficultyBadge } from '@/components/DifficultyBadge'
import styles from './compare.module.scss'

export const metadata: Metadata = {
  title: 'Compare routes',
  description: 'Put the official Camino routes side by side.',
}

const MAX_COMPARE = 4

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const raw = (await searchParams).routes
  const slugs = [
    ...new Set(
      (Array.isArray(raw) ? raw : raw ? [raw] : [])
        .flatMap((entry) => entry.split(','))
        .map((entry) => entry.trim())
        .filter(Boolean),
    ),
  ].slice(0, MAX_COMPARE)

  const routes = await getRoutesBySlugs(slugs)

  if (routes.length === 0) {
    return (
      <>
        <h1 className="page-title">Compare routes</h1>
        <p className="page-lede">
          Nothing selected yet. Tick <em>Compare</em> on two or more routes in the
          catalog and they will line up here.
        </p>
        <Link href="/" className="btn btn-arrow mt-2">
          Browse all routes
        </Link>
      </>
    )
  }

  const rows: { label: string; render: (route: (typeof routes)[number]) => React.ReactNode }[] = [
    { label: 'Distance', render: (route) => `${route.totalKm} km` },
    { label: 'Typical days', render: (route) => `${route.typicalDays} days` },
    {
      label: 'Difficulty',
      render: (route) => <DifficultyBadge difficulty={route.difficulty} />,
    },
    { label: 'Starts', render: (route) => route.startPlace },
    { label: 'Finishes', render: (route) => route.endPlace },
    { label: 'Countries', render: (route) => route.countries.join(', ') },
    {
      label: 'Average day',
      render: (route) => `${(route.totalKm / route.typicalDays).toFixed(1)} km`,
    },
    { label: 'Pilgrims', render: (route) => formatPopularity(route.popularity) },
    { label: 'Best season', render: (route) => route.bestSeason },
    { label: 'Waymarking', render: (route) => route.waymarking },
    {
      label: 'UNESCO listed',
      render: (route) => (route.isUnesco ? 'Yes' : 'No'),
    },
  ]

  return (
    <>
      <header className="mb-4">
        <p className="eyebrow mb-2">Side by side</p>
        <h1 className="page-title">
          Comparing {routes.length} {routes.length === 1 ? 'route' : 'routes'}
        </h1>
        {routes.length === 1 && (
          <p className="page-lede">
            Only one route selected — go back and tick another to see a real comparison.
          </p>
        )}
      </header>

      <div className={styles.wrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col" className={styles.rowLabel}>
                <span className="visually-hidden">Attribute</span>
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
        ← Back to all routes
      </Link>
    </>
  )
}
