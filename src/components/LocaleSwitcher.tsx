'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Link, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import styles from './LocaleSwitcher.module.scss'

export function LocaleSwitcher() {
  const locale = useLocale()
  const t = useTranslations('LocaleSwitcher')
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = Object.fromEntries(searchParams.entries())

  return (
    <div className={styles.switcher} aria-label={t('ariaLabel')}>
      {routing.locales.map((loc, index) => (
        <span key={loc} className={styles.item}>
          {index > 0 && (
            <span aria-hidden="true" className={styles.separator}>
              ·
            </span>
          )}
          {loc === locale ? (
            <span className={styles.active} aria-current="true">
              {loc.toUpperCase()}
            </span>
          ) : (
            <Link href={{ pathname, query }} locale={loc} className={styles.link}>
              {loc.toUpperCase()}
            </Link>
          )}
        </span>
      ))}
    </div>
  )
}
