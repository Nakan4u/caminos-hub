import { getTranslations } from 'next-intl/server'
import type { Difficulty } from '@/lib/filters'
import styles from './DifficultyBadge.module.scss'

export async function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const t = await getTranslations('Difficulty')

  return (
    <span className={`${styles.badge} ${styles[difficulty]}`}>
      <span className={styles.dot} aria-hidden="true" />
      {t(`${difficulty}.label`)}
    </span>
  )
}
