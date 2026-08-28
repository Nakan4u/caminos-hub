import 'server-only'
import { cache } from 'react'
import { auth } from '@/auth'
import { redirect } from '@/i18n/navigation'

export type CurrentUser = { id: string; email: string; name: string | null }

/**
 * The session read, deduped per render pass. Returns the JWT-backed user or null
 * — no database round-trip. This is the app's authorization choke point: call it
 * (or `requireUser`) close to the data, never gate rendering in `layout.tsx`.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth()
  const user = session?.user
  if (!user?.id || !user.email) return null
  return { id: user.id, email: user.email, name: user.name ?? null }
})

/** Same as `getCurrentUser` but redirects to the locale-prefixed login page when signed out. */
export async function requireUser(locale: string): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (user) return user
  redirect({ href: '/login', locale })
  throw new Error('redirect() did not halt execution')
}
