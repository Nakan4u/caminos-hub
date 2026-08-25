import Link from 'next/link'
import type { RouteSummary } from '@/lib/routes'
import { DifficultyBadge } from './DifficultyBadge'
import { CompareToggle } from './CompareToggle'
import styles from './RouteCard.module.scss'

export function RouteCard({ route }: { route: RouteSummary }) {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.name}>
            <Link href={`/routes/${route.slug}`}>{route.nameEs}</Link>
          </h2>
          <div className={styles.nameEn}>{route.name}</div>
        </div>
        {route.isUnesco && <span className={styles.unesco}>UNESCO</span>}
      </div>

      <p className={styles.summary}>{route.summary}</p>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{route.totalKm}</span>
          <span className={styles.statLabel}>km</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{route.typicalDays}</span>
          <span className={styles.statLabel}>days</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{route.countries.length}</span>
          <span className={styles.statLabel}>
            {route.countries.length === 1 ? 'country' : 'countries'}
          </span>
        </div>
      </div>

      <p className={styles.endpoints}>
        {route.startPlace} <span className={styles.arrow}>→</span> {route.endPlace}
      </p>

      <div className={styles.footer}>
        <DifficultyBadge difficulty={route.difficulty} />
        <CompareToggle slug={route.slug} />
      </div>
    </article>
  )
}
