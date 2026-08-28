export const ROUTE_LIST_STATUSES = ['PLANNED', 'COMPLETED'] as const

export type RouteListStatus = (typeof ROUTE_LIST_STATUSES)[number]

export function isRouteListStatus(value: string): value is RouteListStatus {
  return (ROUTE_LIST_STATUSES as readonly string[]).includes(value)
}
