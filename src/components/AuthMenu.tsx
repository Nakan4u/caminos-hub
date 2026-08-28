import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getCurrentUser } from '@/lib/auth-dal'
import { Avatar } from './Avatar'
import { LogoutButton } from './LogoutButton'
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
    <div className={styles.menu}>
      <Link href="/my-routes">{t('navMyRoutes')}</Link>
      <Avatar src={user.image} name={user.name} email={user.email} />
      <span className={styles.greeting}>
        {t('menuGreeting', { name: user.name ?? user.email })}
      </span>
      <LogoutButton locale={locale} />
    </div>
  )
}

export function AuthMenuFallback() {
  return <span className={styles.placeholder} aria-hidden="true" />
}
