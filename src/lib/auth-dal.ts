import 'server-only'
import { cache } from 'react'
import { auth } from '@/auth'
import { redirect } from '@/i18n/navigation'
import { getAccountSummary } from '@/lib/users'

export type CurrentUser = {
  id: string
  email: string
  name: string | null
  /** Resolved avatar URL: the local avatar route for an uploaded image, else the
   *  stored (Google) URL, else null. */
  image: string | null
  /** True for credentials accounts; false for Google-only ones. */
  hasPassword: boolean
}

/**
 * The session read, deduped per render pass. `id`/`email` come from the JWT with
 * no database hit; `name`/`image`/`hasPassword` come from one `cache()`-deduped
 * row read so profile edits show immediately (the JWT can't carry an uploaded
 * avatar). Returns null when signed out or when the row is gone (deleted account).
 *
 * This is the app's authorization choke point: call it (or `requireUser`) close
 * to the data, never gate rendering in `layout.tsx`.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth()
  const user = session?.user
  if (!user?.id || !user.email) return null

  const summary = await getAccountSummary(user.id)
  if (!summary) return null

  return {
    id: user.id,
    email: user.email,
    name: summary.name,
    image: summary.image,
    hasPassword: summary.hasPassword,
  }
})

/** Same as `getCurrentUser` but redirects to the locale-prefixed login page when signed out. */
export async function requireUser(locale: string): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (user) return user
  redirect({ href: '/login', locale })
  throw new Error('redirect() did not halt execution')
}
