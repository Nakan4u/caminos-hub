'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import styles from './LocaleSwitcher.module.scss'

const LOCALE_LABELS: Record<string, string> = {
  en: 'English',
  uk: 'Українська',
}

export function LocaleSwitcher() {
  const locale = useLocale()
  const t = useTranslations('LocaleSwitcher')
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const query = Object.fromEntries(searchParams.entries())

  return (
    <select
      className={styles.select}
      aria-label={t('ariaLabel')}
      value={locale}
      disabled={isPending}
      onChange={(event) => {
        const nextLocale = event.target.value
        startTransition(() => {
          router.replace({ pathname, query }, { locale: nextLocale })
        })
      }}
    >
      {routing.locales.map((loc) => (
        <option key={loc} value={loc}>
          {LOCALE_LABELS[loc] ?? loc.toUpperCase()}
        </option>
      ))}
    </select>
  )
}
