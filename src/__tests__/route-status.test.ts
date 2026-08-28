import { describe, expect, it } from 'vitest'
import { ROUTE_LIST_STATUSES, isRouteListStatus } from '@/lib/route-status'

describe('ROUTE_LIST_STATUSES', () => {
  it('is exactly the two saved-list states', () => {
    expect([...ROUTE_LIST_STATUSES]).toEqual(['PLANNED', 'COMPLETED'])
  })
})

describe('isRouteListStatus', () => {
  it('accepts the known statuses', () => {
    for (const value of ROUTE_LIST_STATUSES) {
      expect(isRouteListStatus(value)).toBe(true)
    }
  })

  it('rejects unknown, mis-cased, and empty values', () => {
    expect(isRouteListStatus('planned')).toBe(false)
    expect(isRouteListStatus('DONE')).toBe(false)
    expect(isRouteListStatus('')).toBe(false)
    expect(isRouteListStatus('PLANNED ')).toBe(false)
  })
})
