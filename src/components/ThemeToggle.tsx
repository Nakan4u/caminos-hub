'use client'

import { setThemeCookie } from '@/lib/theme'
import styles from './ThemeToggle.module.scss'

export function ThemeToggle() {
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
      aria-label="Toggle light/dark theme"
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
