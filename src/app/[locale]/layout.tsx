import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@/styles/globals.scss'
import { routing } from '@/i18n/routing'
import { Link } from '@/i18n/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ThemeBootstrap } from '@/components/ThemeBootstrap'
import { THEME_COOKIE, parseTheme } from '@/lib/theme'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Layout' })
  return {
    title: {
      default: t('metaTitle'),
      template: '%s · Camino-Hub',
    },
    description: t('metaDescription'),
  }
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations('Layout')

  const cookieStore = await cookies()
  const storedTheme = parseTheme(cookieStore.get(THEME_COOKIE)?.value)

  return (
    <html lang={locale} data-theme={storedTheme ?? 'light'}>
      <body>
        <NextIntlClientProvider>
          <header className="site-header">
            <div className="container d-flex align-items-center justify-content-between py-3">
              <Link href="/" className="site-header__brand">
                Camino<span>·</span>Hub
              </Link>
              <nav className="site-header__nav d-flex align-items-center gap-4">
                <Link href="/">{t('navAllRoutes')}</Link>
                <Link href="/compare">{t('navCompare')}</Link>
                <ThemeToggle />
              </nav>
            </div>
          </header>

          <main className="container py-4 py-md-5">{children}</main>

          <footer className="site-footer mt-5">
            <div className="container py-4">
              <p className="mb-1">{t('footerLine1')}</p>
              <p className="mb-0">{t('footerLine2')}</p>
            </div>
          </footer>

          {!storedTheme && <ThemeBootstrap />}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
