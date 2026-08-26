'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { MAX_COMPARE, useCompare } from './CompareProvider'
import styles from './CompareBar.module.scss'

export function CompareBar() {
  const t = useTranslations('CompareBar')
  const { selected, clear, isFull } = useCompare()
  if (selected.length === 0) return null

  const href = `/compare?routes=${selected.join(',')}`

  return (
    <div className={styles.bar}>
      <span className={styles.count}>
        {t('selectedCount', { count: selected.length, max: MAX_COMPARE })}
      </span>
      <span className={styles.hint}>
        {selected.length < 2
          ? t('hintPickMore')
          : isFull
            ? t('hintFull')
            : t('hintMore')}
      </span>
      <span className={styles.spacer} />
      <button type="button" className="btn btn-sm btn-outline-light" onClick={clear}>
        {t('clear')}
      </button>
      <Link
        href={href}
        className={`btn btn-sm btn-arrow ${selected.length < 2 ? 'disabled' : ''}`}
        aria-disabled={selected.length < 2}
      >
        {t('compare')}
      </Link>
    </div>
  )
}
