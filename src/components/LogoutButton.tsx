'use client'

import { useTranslations } from 'next-intl'
import { logoutAction } from '@/lib/actions/auth'
import styles from './AuthMenu.module.scss'

export function LogoutButton({ locale }: { locale: string }) {
  const t = useTranslations('Layout')
  return (
    <form action={logoutAction.bind(null, locale)}>
      <button type="submit" className={styles.signOut}>
        {t('navSignOut')}
      </button>
    </form>
  )
}
