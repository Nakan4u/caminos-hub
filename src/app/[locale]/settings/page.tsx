import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { requireUser } from '@/lib/auth-dal'
import { SettingsProfileForm } from '@/components/SettingsProfileForm'
import { SettingsPasswordForm } from '@/components/SettingsPasswordForm'
import { SettingsDeleteForm } from '@/components/SettingsDeleteForm'
import styles from './settings.module.scss'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Settings' })
  return { title: t('metaTitle'), description: t('metaDescription') }
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const user = await requireUser(locale)
  const t = await getTranslations('Settings')

  return (
    <div className={styles.wrapper}>
      <header className="mb-4">
        <p className="eyebrow mb-2">{t('eyebrow')}</p>
        <h1 className="page-title">{t('title')}</h1>
        <p className="page-lede">{t('lede')}</p>
      </header>

      <SettingsProfileForm
        locale={locale}
        name={user.name}
        email={user.email}
        image={user.image}
      />

      <section className={styles.section}>
        <h2 className={styles.heading}>{t('passwordHeading')}</h2>
        {user.hasPassword ? (
          <>
            <p className={styles.sectionLede}>{t('passwordLede')}</p>
            <SettingsPasswordForm locale={locale} />
          </>
        ) : (
          <p className={styles.sectionLede}>{t('passwordGoogleNote')}</p>
        )}
      </section>

      <SettingsDeleteForm locale={locale} email={user.email} />

      <Link href="/my-routes" className="btn btn-outline-secondary mt-2">
        {t('backLink')}
      </Link>
    </div>
  )
}
