import { describe, expect, it } from 'vitest'
import { avatarInitial } from '@/lib/avatar'

describe('avatarInitial', () => {
  it('uses the first letter of the name, upper-cased', () => {
    expect(avatarInitial('pilgrim', 'someone@camino.es')).toBe('P')
  })

  it('skips leading punctuation and whitespace in the name', () => {
    expect(avatarInitial('  "José"', 'x@y.co')).toBe('J')
  })

  it('falls back to the email when the name is missing or blank', () => {
    expect(avatarInitial(null, 'walker@camino.es')).toBe('W')
    expect(avatarInitial('   ', 'walker@camino.es')).toBe('W')
  })

  it('handles non-latin scripts', () => {
    expect(avatarInitial('Олег', 'oleh@camino.es')).toBe('О')
  })

  it('returns ? when there is nothing usable', () => {
    expect(avatarInitial(null, '')).toBe('?')
    expect(avatarInitial('!!!', '@@@')).toBe('?')
  })
})
