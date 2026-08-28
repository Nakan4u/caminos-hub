import 'server-only'
import { prisma } from '@/lib/prisma'
import { localeAndFallback, localizeRoute, type LocalizedRoute } from '@/lib/localize'
import type { RouteListStatus } from '@/lib/route-status'

/**
 * Per-user saved-route data access. The second module (besides `src/lib/routes.ts`,
 * and the Auth.js adapter in `src/auth.ts`) allowed to touch the database. Every
 * export is async and returns already-localized plain objects.
 */

/** `{ [routeSlug]: status }` for every route the user has saved — hydrates the catalog/detail controls. */
export async function getUserRouteStatuses(
  userId: string,
): Promise<Record<string, RouteListStatus>> {
  const rows = await prisma.userRoute.findMany({
    where: { userId },
    select: { status: true, route: { select: { slug: true } } },
  })
  return Object.fromEntries(rows.map((row) => [row.route.slug, row.status]))
}

/** The saved status for one route, or null when it's on neither list. */
export async function getUserRouteStatus(
  userId: string,
  slug: string,
): Promise<RouteListStatus | null> {
  const row = await prisma.userRoute.findFirst({
    where: { userId, route: { slug } },
    select: { status: true },
  })
  return row?.status ?? null
}

/** Both saved lists for the dashboard, localized, ordered by route popularity. */
export async function listUserRoutes(
  userId: string,
  locale: string,
): Promise<{ planned: LocalizedRoute[]; completed: LocalizedRoute[] }> {
  const rows = await prisma.userRoute.findMany({
    where: { userId },
    orderBy: { route: { popularity: 'desc' } },
    include: {
      route: {
        include: {
          translations: { where: { locale: { in: localeAndFallback(locale) } } },
        },
      },
    },
  })

  const planned: LocalizedRoute[] = []
  const completed: LocalizedRoute[] = []
  for (const row of rows) {
    const route = localizeRoute(row.route, locale)
    ;(row.status === 'COMPLETED' ? completed : planned).push(route)
  }
  return { planned, completed }
}

/** Upsert the user's status for a route. A single row per (user, route) — marking
 *  COMPLETED overwrites PLANNED, so the route leaves the planned list automatically. */
export async function setRouteStatus(
  userId: string,
  slug: string,
  status: RouteListStatus,
): Promise<void> {
  const route = await prisma.route.findUnique({ where: { slug }, select: { id: true } })
  if (!route) throw new Error(`Unknown route slug: ${slug}`)

  await prisma.userRoute.upsert({
    where: { userId_routeId: { userId, routeId: route.id } },
    update: { status },
    create: { userId, routeId: route.id, status },
  })
}

/** Remove a route from the user's lists. No-op when it wasn't saved. */
export async function clearRouteStatus(userId: string, slug: string): Promise<void> {
  await prisma.userRoute.deleteMany({ where: { userId, route: { slug } } })
}
