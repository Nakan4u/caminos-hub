import { describe, expect, it } from 'vitest'
import {
  PASSWORD_MAX,
  PASSWORD_MIN,
  isValidEmail,
  normalizeEmail,
  validateLogin,
  validateRegistration,
} from '@/lib/auth-validation'

describe('normalizeEmail', () => {
  it('trims surrounding whitespace and lower-cases', () => {
    expect(normalizeEmail('  Pilgrim@Camino.ES  ')).toBe('pilgrim@camino.es')
  })
})

describe('isValidEmail', () => {
  it.each(['a@b.co', 'pilgrim.name@sub.example.com', 'x+tag@example.org'])(
    'accepts %s',
    (value) => {
      expect(isValidEmail(value)).toBe(true)
    },
  )

  it.each(['', 'plainaddress', 'no@dot', 'spaces in@email.com', '@no-local.com'])(
    'rejects %s',
    (value) => {
      expect(isValidEmail(value)).toBe(false)
    },
  )

  it('rejects an address longer than the max length', () => {
    const local = 'a'.repeat(250)
    expect(isValidEmail(`${local}@example.com`)).toBe(false)
  })
})

describe('validateRegistration', () => {
  it('normalises and returns the cleaned data for a good payload', () => {
    const result = validateRegistration({
      email: '  Walker@Camino.com ',
      password: 'longenough',
      name: '  Ada  ',
    })
    expect(result).toEqual({
      ok: true,
      data: { email: 'walker@camino.com', password: 'longenough', name: 'Ada' },
    })
  })

  it('treats a blank or missing name as null but still succeeds', () => {
    const result = validateRegistration({
      email: 'walker@camino.com',
      password: 'longenough',
      name: '   ',
    })
    expect(result).toEqual({
      ok: true,
      data: { email: 'walker@camino.com', password: 'longenough', name: null },
    })
  })

  it('rejects a malformed email with EMAIL_INVALID', () => {
    const result = validateRegistration({
      email: 'not-an-email',
      password: 'longenough',
      name: null,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.email).toBe('EMAIL_INVALID')
  })

  it('rejects a short password with PASSWORD_TOO_SHORT', () => {
    const result = validateRegistration({
      email: 'walker@camino.com',
      password: 'a'.repeat(PASSWORD_MIN - 1),
      name: null,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.password).toBe('PASSWORD_TOO_SHORT')
  })

  it('rejects an over-long password with PASSWORD_TOO_LONG', () => {
    const result = validateRegistration({
      email: 'walker@camino.com',
      password: 'a'.repeat(PASSWORD_MAX + 1),
      name: null,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.password).toBe('PASSWORD_TOO_LONG')
  })

  it('rejects an over-long name with NAME_TOO_LONG', () => {
    const result = validateRegistration({
      email: 'walker@camino.com',
      password: 'longenough',
      name: 'a'.repeat(200),
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.name).toBe('NAME_TOO_LONG')
  })

  it('rejects non-string credentials', () => {
    const result = validateRegistration({ email: 42, password: {}, name: [] })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors.email).toBe('EMAIL_INVALID')
      expect(result.errors.password).toBe('PASSWORD_TOO_SHORT')
    }
  })
})

describe('validateLogin', () => {
  it('returns cleaned data for a plausible payload', () => {
    const result = validateLogin({ email: ' User@Camino.com ', password: 'secret' })
    expect(result).toEqual({
      ok: true,
      data: { email: 'user@camino.com', password: 'secret' },
    })
  })

  it('rejects a malformed email', () => {
    const result = validateLogin({ email: 'nope', password: 'secret' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.email).toBe('EMAIL_INVALID')
  })

  it('rejects an empty password with PASSWORD_REQUIRED', () => {
    const result = validateLogin({ email: 'user@camino.com', password: '' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.password).toBe('PASSWORD_REQUIRED')
  })
})
