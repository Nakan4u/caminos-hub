'use client'

import { useTranslations } from 'next-intl'
import { useCompare } from './CompareProvider'

export function CompareToggle({ slug }: { slug: string }) {
  const t = useTranslations('CompareBar')
  const { isSelected, toggle, isFull } = useCompare()
  const checked = isSelected(slug)
  const inputId = `compare-${slug}`

  return (
    <div className="form-check mb-0">
      <input
        id={inputId}
        className="form-check-input"
        type="checkbox"
        checked={checked}
        disabled={!checked && isFull}
        onChange={() => toggle(slug)}
      />
      <label className="form-check-label small text-secondary" htmlFor={inputId}>
        {t('compare')}
      </label>
    </div>
  )
}
