import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { requireUser } from '@/lib/auth-dal'
import { listUserRoutes } from '@/lib/user-routes'
import { Avatar } from '@/components/Avatar'
import { RouteCard } from '@/components/RouteCard'
import { CompareProvider } from '@/components/CompareProvider'
import { CompareBar } from '@/components/CompareBar'
import type { LocalizedRoute } from '@/lib/localize'
import styles from './my-routes.module.scss'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'MyRoutes' })
  return { title: t('metaTitle'), description: t('metaDescription') }
}

export default async function MyRoutesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const user = await requireUser(locale)
  const t = await getTranslations('MyRoutes')
  const { planned, completed } = await listUserRoutes(user.id, locale)

  function section(
    heading: string,
    emptyCopy: string,
    routes: LocalizedRoute[],
    status: 'PLANNED' | 'COMPLETED',
  ) {
    return (
      <section className={styles.section}>
        <h2 className={styles.heading}>{heading}</h2>
        {routes.length === 0 ? (
          <p className={styles.empty}>{emptyCopy}</p>
        ) : (
          <div className="row g-3 g-md-4">
            {routes.map((route) => (
              <div className="col-12 col-md-6 col-xl-4" key={route.slug}>
                <RouteCard route={route} listStatus={status} isLoggedIn />
              </div>
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <>
      <header className={styles.pageHeader}>
        <Avatar
          src={user.image}
          name={user.name}
          email={user.email}
          size={56}
        />
        <div>
          <p className="eyebrow mb-2">{t('eyebrow')}</p>
          <h1 className="page-title">{t('title')}</h1>
          <p className="page-lede">{t('lede')}</p>
        </div>
      </header>

      <CompareProvider>
        {section(t('plannedHeading'), t('plannedEmpty'), planned, 'PLANNED')}
        {section(t('walkedHeading'), t('walkedEmpty'), completed, 'COMPLETED')}

        <CompareBar />
      </CompareProvider>

      <Link href="/" className="btn btn-outline-secondary mt-2">
        {t('browseLink')}
      </Link>
    </>
  )
}
