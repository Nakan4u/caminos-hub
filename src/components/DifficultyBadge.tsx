import type { Difficulty } from '@/lib/filters'
import { DIFFICULTY_LABELS } from '@/lib/format'
import styles from './DifficultyBadge.module.scss'

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`${styles.badge} ${styles[difficulty]}`}>
      <span className={styles.dot} aria-hidden="true" />
      {DIFFICULTY_LABELS[difficulty]}
    </span>
  )
}
