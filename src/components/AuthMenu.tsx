import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getCurrentUser } from '@/lib/auth-dal'
import { UserMenu } from './UserMenu'
import styles from './AuthMenu.module.scss'

/** Header chrome. Kept out of `layout.tsx`'s blocking path — render inside a
 *  `<Suspense>` so the session read never holds up the shell. */
export async function AuthMenu({ locale }: { locale: string }) {
  const t = await getTranslations('Layout')
  const user = await getCurrentUser()

  if (!user) {
    return <Link href="/login">{t('navSignIn')}</Link>
  }

  return (
    <UserMenu
      locale={locale}
      name={user.name}
      email={user.email}
      image={user.image}
      labels={{
        greeting: t('menuGreeting', { name: user.name ?? user.email }),
        myRoutes: t('navMyRoutes'),
        settings: t('navSettings'),
        signOut: t('navSignOut'),
      }}
    />
  )
}

export function AuthMenuFallback() {
  return <span className={styles.placeholder} aria-hidden="true" />
}
