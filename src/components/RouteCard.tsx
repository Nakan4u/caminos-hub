import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { RouteSummary } from '@/lib/routes'
import type { RouteListStatus } from '@/lib/route-status'
import { DifficultyBadge } from './DifficultyBadge'
import { CompareToggle } from './CompareToggle'
import { RouteListControl } from './RouteListControl'
import styles from './RouteCard.module.scss'

export async function RouteCard({
  route,
  listStatus = null,
  isLoggedIn = false,
}: {
  route: RouteSummary
  listStatus?: RouteListStatus | null
  isLoggedIn?: boolean
}) {
  const t = await getTranslations('RouteCard')
  const tFormat = await getTranslations('Format')
  const tCountries = await getTranslations('Countries')

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.name}>
            <Link href={`/routes/${route.slug}`}>{route.nameEs}</Link>
          </h2>
          <div className={styles.nameEn}>{route.name}</div>
        </div>
        {route.isUnesco && <span className={styles.unesco}>{t('unesco')}</span>}
      </div>

      <p className={styles.summary}>{route.summary}</p>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{route.totalKm}</span>
          <span className={styles.statLabel}>{tFormat('kmUnit')}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{route.typicalDays}</span>
          <span className={styles.statLabel}>
            {tFormat('daysUnit', { days: route.typicalDays })}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{route.countries.length}</span>
          <span className={styles.statLabel}>
            {tCountries('count', { count: route.countries.length })}
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

      {(isLoggedIn || listStatus !== null) && (
        <div className={styles.listControl}>
          <RouteListControl
            slug={route.slug}
            status={listStatus}
            isLoggedIn={isLoggedIn}
          />
        </div>
      )}
    </article>
  )
}
