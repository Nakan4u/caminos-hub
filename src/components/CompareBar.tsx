'use client'

import Link from 'next/link'
import { MAX_COMPARE, useCompare } from './CompareProvider'
import styles from './CompareBar.module.scss'

export function CompareBar() {
  const { selected, clear, isFull } = useCompare()
  if (selected.length === 0) return null

  const href = `/compare?routes=${selected.join(',')}`

  return (
    <div className={styles.bar}>
      <span className={styles.count}>
        {selected.length} of {MAX_COMPARE} selected
      </span>
      <span className={styles.hint}>
        {selected.length < 2
          ? 'Pick at least one more to compare.'
          : isFull
            ? 'That is the maximum.'
            : 'Add more, or compare now.'}
      </span>
      <span className={styles.spacer} />
      <button type="button" className="btn btn-sm btn-outline-light" onClick={clear}>
        Clear
      </button>
      <Link
        href={href}
        className={`btn btn-sm btn-arrow ${selected.length < 2 ? 'disabled' : ''}`}
        aria-disabled={selected.length < 2}
      >
        Compare
      </Link>
    </div>
  )
}
