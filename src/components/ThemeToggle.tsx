'use client'

import { useTranslations } from 'next-intl'
import { setThemeCookie } from '@/lib/theme'
import styles from './ThemeToggle.module.scss'

export function ThemeToggle() {
  const t = useTranslations('ThemeToggle')

  function toggle() {
    const root = document.documentElement
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
    root.setAttribute('data-theme', next)
    setThemeCookie(next)
  }

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={t('ariaLabel')}
    >
      <span aria-hidden="true" className={styles.sun}>
        ☀
      </span>
      <span aria-hidden="true" className={styles.moon}>
        ☾
      </span>
    </button>
  )
}
