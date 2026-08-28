'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth-dal'
import { isRouteListStatus } from '@/lib/route-status'
import { clearRouteStatus, setRouteStatus } from '@/lib/user-routes'

export type RouteStatusActionResult = { ok: true } | { error: 'UNAUTHENTICATED' | 'BAD_REQUEST' }

/** Save or move a route between the user's Planned / Walked lists. Re-checks the
 *  session — a Server Action is a public endpoint regardless of what the UI showed. */
export async function setRouteStatusAction(
  slug: unknown,
  status: unknown,
): Promise<RouteStatusActionResult> {
  const user = await getCurrentUser()
  if (!user) return { error: 'UNAUTHENTICATED' }

  if (typeof slug !== 'string' || !slug) return { error: 'BAD_REQUEST' }
  if (typeof status !== 'string' || !isRouteListStatus(status)) return { error: 'BAD_REQUEST' }

  const applied = await setRouteStatus(user.id, slug, status)
  if (!applied) return { error: 'BAD_REQUEST' }

  revalidatePath('/[locale]/my-routes', 'page')
  return { ok: true }
}

/** Remove a route from the user's lists. */
export async function clearRouteStatusAction(
  slug: unknown,
): Promise<RouteStatusActionResult> {
  const user = await getCurrentUser()
  if (!user) return { error: 'UNAUTHENTICATED' }

  if (typeof slug !== 'string' || !slug) return { error: 'BAD_REQUEST' }

  await clearRouteStatus(user.id, slug)
  revalidatePath('/[locale]/my-routes', 'page')
  return { ok: true }
}
