/**
 * Pure input validation for the account-settings forms. No database, no
 * framework imports — the boundary check that runs before `src/lib/actions/
 * account.ts` touches Prisma. Errors are stable string codes the UI maps to
 * `Settings` messages, mirroring `src/lib/auth-validation.ts`.
 */

import { NAME_MAX, PASSWORD_MAX, PASSWORD_MIN } from './auth-validation'

type DisplayNameResult =
  | { ok: true; data: { name: string | null } }
  | { ok: false; error: 'NAME_TOO_LONG' }

export function validateDisplayName(input: unknown): DisplayNameResult {
  const name = typeof input === 'string' ? input.trim() : ''
  if (name.length > NAME_MAX) return { ok: false, error: 'NAME_TOO_LONG' }
  return { ok: true, data: { name: name || null } }
}

type PasswordChangeErrors = {
  currentPassword?: 'CURRENT_REQUIRED'
  newPassword?: 'PASSWORD_TOO_SHORT' | 'PASSWORD_TOO_LONG' | 'SAME_PASSWORD'
}

type PasswordChangeResult =
  | { ok: true; data: { currentPassword: string; newPassword: string } }
  | { ok: false; errors: PasswordChangeErrors }

export function validatePasswordChange(input: {
  currentPassword: unknown
  newPassword: unknown
}): PasswordChangeResult {
  const errors: PasswordChangeErrors = {}

  const currentPassword =
    typeof input.currentPassword === 'string' ? input.currentPassword : ''
  const newPassword =
    typeof input.newPassword === 'string' ? input.newPassword : ''

  if (currentPassword.length === 0) errors.currentPassword = 'CURRENT_REQUIRED'

  if (newPassword.length < PASSWORD_MIN) errors.newPassword = 'PASSWORD_TOO_SHORT'
  else if (newPassword.length > PASSWORD_MAX)
    errors.newPassword = 'PASSWORD_TOO_LONG'
  else if (newPassword === currentPassword) errors.newPassword = 'SAME_PASSWORD'

  if (errors.currentPassword || errors.newPassword) return { ok: false, errors }

  return { ok: true, data: { currentPassword, newPassword } }
}

export const AVATAR_MAX_BYTES = 1_048_576
export const AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const

type AvatarUploadResult =
  | { ok: true }
  | { ok: false; error: 'AVATAR_EMPTY' | 'AVATAR_TOO_LARGE' | 'AVATAR_TYPE' }

export function validateAvatarUpload(input: {
  size: number
  type: string
}): AvatarUploadResult {
  if (input.size <= 0) return { ok: false, error: 'AVATAR_EMPTY' }
  if (input.size > AVATAR_MAX_BYTES) return { ok: false, error: 'AVATAR_TOO_LARGE' }
  if (!(AVATAR_TYPES as readonly string[]).includes(input.type)) {
    return { ok: false, error: 'AVATAR_TYPE' }
  }
  return { ok: true }
}
