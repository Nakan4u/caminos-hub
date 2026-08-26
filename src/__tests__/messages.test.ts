import { describe, expect, it } from 'vitest'
import en from '../../messages/en.json'
import uk from '../../messages/uk.json'

/** Recursively collects dotted leaf-key paths from a nested message catalog. */
function leafKeys(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return [prefix]
  }
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    leafKeys(child, prefix ? `${prefix}.${key}` : key),
  )
}

describe('message catalogs', () => {
  it('expose the exact same set of keys in en and uk', () => {
    const enKeys = leafKeys(en).sort()
    const ukKeys = leafKeys(uk).sort()

    expect(ukKeys).toEqual(enKeys)
  })
})
