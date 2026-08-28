import { describe, expect, it } from 'vitest'
import {
  AVATAR_MAX_BYTES,
  AVATAR_TYPES,
  validateAvatarUpload,
  validateDisplayName,
  validatePasswordChange,
} from '@/lib/account-validation'

describe('validateDisplayName', () => {
  it('accepts a normal name and trims it', () => {
    const result = validateDisplayName('  Pilgrim  ')
    expect(result).toEqual({ ok: true, data: { name: 'Pilgrim' } })
  })

  it('treats a blank name as clearing the name', () => {
    expect(validateDisplayName('   ')).toEqual({ ok: true, data: { name: null } })
  })

  it('treats a non-string as clearing the name', () => {
    expect(validateDisplayName(undefined)).toEqual({
      ok: true,
      data: { name: null },
    })
  })

  it('rejects a name longer than the limit', () => {
    const result = validateDisplayName('x'.repeat(81))
    expect(result).toEqual({ ok: false, error: 'NAME_TOO_LONG' })
  })
})

describe('validatePasswordChange', () => {
  it('accepts a valid current + new password pair', () => {
    const result = validatePasswordChange({
      currentPassword: 'oldsecret1',
      newPassword: 'brandnew-secret',
    })
    expect(result).toEqual({
      ok: true,
      data: { currentPassword: 'oldsecret1', newPassword: 'brandnew-secret' },
    })
  })

  it('requires the current password', () => {
    const result = validatePasswordChange({
      currentPassword: '',
      newPassword: 'brandnew-secret',
    })
    expect(result).toEqual({ ok: false, errors: { currentPassword: 'CURRENT_REQUIRED' } })
  })

  it('rejects a too-short new password', () => {
    const result = validatePasswordChange({
      currentPassword: 'oldsecret1',
      newPassword: 'short',
    })
    expect(result).toEqual({ ok: false, errors: { newPassword: 'PASSWORD_TOO_SHORT' } })
  })

  it('rejects a new password over 72 bytes', () => {
    const result = validatePasswordChange({
      currentPassword: 'oldsecret1',
      newPassword: 'x'.repeat(73),
    })
    expect(result).toEqual({ ok: false, errors: { newPassword: 'PASSWORD_TOO_LONG' } })
  })

  it('rejects a new password identical to the current one', () => {
    const result = validatePasswordChange({
      currentPassword: 'samesecret1',
      newPassword: 'samesecret1',
    })
    expect(result).toEqual({ ok: false, errors: { newPassword: 'SAME_PASSWORD' } })
  })
})

describe('validateAvatarUpload', () => {
  it('accepts each allowed type at the size limit', () => {
    for (const type of AVATAR_TYPES) {
      expect(validateAvatarUpload({ size: AVATAR_MAX_BYTES, type })).toEqual({
        ok: true,
      })
    }
  })

  it('rejects a file over the size limit', () => {
    expect(
      validateAvatarUpload({ size: AVATAR_MAX_BYTES + 1, type: 'image/png' }),
    ).toEqual({ ok: false, error: 'AVATAR_TOO_LARGE' })
  })

  it('rejects an empty file', () => {
    expect(validateAvatarUpload({ size: 0, type: 'image/png' })).toEqual({
      ok: false,
      error: 'AVATAR_EMPTY',
    })
  })

  it('rejects a disallowed type', () => {
    expect(validateAvatarUpload({ size: 100, type: 'image/gif' })).toEqual({
      ok: false,
      error: 'AVATAR_TYPE',
    })
  })
})
