import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match all pathnames except for the ones starting with /api, /_next, /_vercel,
  // the code-generated metadata routes (/icon, /apple-icon), and those
  // containing a dot (i.e. static files like /favicon.ico or /icon.svg).
  matcher: ['/((?!api|_next|_vercel|icon|apple-icon|.*\\..*).*)'],
}
