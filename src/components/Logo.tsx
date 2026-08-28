import { SHELL_PATH, SHELL_RIBS } from '@/lib/logo'
import styles from './Logo.module.scss'

/**
 * The Camino-Hub logo: a scallop shell, the pilgrim's symbol.
 * Decorative — the header keeps the "Camino·Hub" wordmark as the accessible
 * name, so this is hidden from assistive tech.
 *
 * The shell fills with `currentColor`; ribs are drawn in `--color-surface` so
 * they carve cleanly against whatever the logo sits on, in either theme.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className ? `${styles.logo} ${className}` : styles.logo}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <path d={SHELL_PATH} fill="currentColor" />
      {SHELL_RIBS.map((d) => (
        <path
          key={d}
          d={d}
          stroke="var(--color-surface)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}
