import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import type { SearchParams } from '@/lib/filters'
import { getCurrentUser } from '@/lib/auth-dal'
import { redirect } from '@/i18n/navigation'
import { googleSignInAction } from '@/lib/actions/auth'
import { AuthForm } from '@/components/AuthForm'
import styles from './login.module.scss'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Auth' })
  return { title: t('metaTitleLogin') }
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<SearchParams>
}) {
  const { locale } = await params
  if (await getCurrentUser()) redirect({ href: '/my-routes', locale })

  const t = await getTranslations('Auth')
  const callbackUrl = firstParam((await searchParams).callbackUrl)

  return (
    <div className={styles.wrapper}>
      <header className="mb-4">
        <h1 className="page-title">{t('loginTitle')}</h1>
        <p className="page-lede">{t('loginLede')}</p>
      </header>

      <AuthForm mode="login" locale={locale} callbackUrl={callbackUrl} />

      <div className={styles.divider}>{t('orDivider')}</div>

      <form action={googleSignInAction.bind(null, locale)}>
        <button type="submit" className="btn btn-outline-secondary w-100">
          {t('googleButton')}
        </button>
      </form>
    </div>
  )
}
