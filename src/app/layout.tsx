import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@/styles/globals.scss'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ThemeBootstrap } from '@/components/ThemeBootstrap'
import { THEME_COOKIE, parseTheme } from '@/lib/theme'

export const metadata: Metadata = {
  title: {
    default: 'Camino-Hub — the official Camino de Santiago routes',
    template: '%s · Camino-Hub',
  },
  description:
    'Browse, filter and compare the official Camino de Santiago routes: distance, days, difficulty and full stage lists.',
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies()
  const storedTheme = parseTheme(cookieStore.get(THEME_COOKIE)?.value)

  return (
    <html lang="en" data-theme={storedTheme ?? 'light'}>
      <body>
        <header className="site-header">
          <div className="container d-flex align-items-center justify-content-between py-3">
            <Link href="/" className="site-header__brand">
              Camino<span>·</span>Hub
            </Link>
            <nav className="site-header__nav d-flex align-items-center gap-4">
              <Link href="/">All routes</Link>
              <Link href="/compare">Compare</Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        <main className="container py-4 py-md-5">{children}</main>

        <footer className="site-footer mt-5">
          <div className="container py-4">
            <p className="mb-1">
              Camino-Hub lists the officially recognised routes of the Camino de
              Santiago.
            </p>
            <p className="mb-0">
              Distances and stage divisions follow common guidebook conventions and are
              approximate. Always carry a current guide and check conditions locally
              before setting out.
            </p>
          </div>
        </footer>

        {!storedTheme && <ThemeBootstrap />}
      </body>
    </html>
  )
}
