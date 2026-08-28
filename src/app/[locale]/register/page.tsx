import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getCurrentUser } from '@/lib/auth-dal'
import { redirect } from '@/i18n/navigation'
import { googleSignInAction } from '@/lib/actions/auth'
import { AuthForm } from '@/components/AuthForm'
import styles from './register.module.scss'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Auth' })
  return { title: t('metaTitleRegister') }
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (await getCurrentUser()) redirect({ href: '/my-routes', locale })

  const t = await getTranslations('Auth')

  return (
    <div className={styles.wrapper}>
      <header className="mb-4">
        <h1 className="page-title">{t('registerTitle')}</h1>
        <p className="page-lede">{t('registerLede')}</p>
      </header>

      <AuthForm mode="register" locale={locale} />

      <div className={styles.divider}>{t('orDivider')}</div>

      <form action={googleSignInAction.bind(null, locale)}>
        <button type="submit" className="btn btn-outline-secondary w-100">
          {t('googleButton')}
        </button>
      </form>
    </div>
  )
}
