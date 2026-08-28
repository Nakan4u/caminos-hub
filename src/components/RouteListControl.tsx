'use client'

import { useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { ROUTE_LIST_STATUSES, type RouteListStatus } from '@/lib/route-status'
import {
  clearRouteStatusAction,
  setRouteStatusAction,
} from '@/lib/actions/route-status'
import styles from './RouteListControl.module.scss'

interface Props {
  slug: string
  status: RouteListStatus | null
  isLoggedIn: boolean
}

const LABEL_KEY: Record<RouteListStatus, 'wantToWalk' | 'walked'> = {
  PLANNED: 'wantToWalk',
  COMPLETED: 'walked',
}

export function RouteListControl({ slug, status, isLoggedIn }: Props) {
  const t = useTranslations('RouteListControl')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  if (!isLoggedIn) {
    return (
      <Link href="/login" className={styles.signIn}>
        {t('signInToSave')}
      </Link>
    )
  }

  function run(work: () => Promise<unknown>) {
    startTransition(async () => {
      await work()
      router.refresh()
    })
  }

  return (
    <div className={styles.group} role="group" aria-label={t('savingLabel')}>
      {ROUTE_LIST_STATUSES.map((value) => {
        const active = status === value
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            disabled={isPending}
            className={`${styles.button} ${active ? styles.active : ''}`}
            onClick={() =>
              run(() =>
                active
                  ? clearRouteStatusAction(slug)
                  : setRouteStatusAction(slug, value),
              )
            }
          >
            {t(LABEL_KEY[value])}
          </button>
        )
      })}
      {status !== null && (
        <button
          type="button"
          disabled={isPending}
          className={styles.clear}
          onClick={() => run(() => clearRouteStatusAction(slug))}
        >
          {t('clear')}
        </button>
      )}
    </div>
  )
}
