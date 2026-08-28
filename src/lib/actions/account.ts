'use server'

import { revalidatePath } from 'next/cache'
import { hasLocale } from 'next-intl'
import { signOut } from '@/auth'
import { getCurrentUser } from '@/lib/auth-dal'
import {
  changePassword,
  deleteAccount,
  removeAvatar,
  updateAvatar,
  updateDisplayName,
} from '@/lib/users'
import {
  validateAvatarUpload,
  validateDisplayName,
  validatePasswordChange,
} from '@/lib/account-validation'
import { normalizeEmail } from '@/lib/auth-validation'
import { routing } from '@/i18n/routing'
import { redirect } from '@/i18n/navigation'

export type AccountFormState = {
  errors?: Record<string, string>
  ok?: true
}

function resolveLocale(formData: FormData): string {
  const raw = formData.get('locale')
  return typeof raw === 'string' && hasLocale(routing.locales, raw)
    ? raw
    : routing.defaultLocale
}

/** A Server Action is a public endpoint — re-resolve the session on every call. */
async function requireUserId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.id ?? null
}

export async function updateNameAction(
  _prev: AccountFormState | undefined,
  formData: FormData,
): Promise<AccountFormState> {
  const userId = await requireUserId()
  if (!userId) return { errors: { form: 'NOT_SIGNED_IN' } }

  const result = validateDisplayName(formData.get('name'))
  if (!result.ok) return { errors: { name: result.error } }

  await updateDisplayName(userId, result.data.name)
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function updateAvatarAction(
  _prev: AccountFormState | undefined,
  formData: FormData,
): Promise<AccountFormState> {
  const userId = await requireUserId()
  if (!userId) return { errors: { form: 'NOT_SIGNED_IN' } }

  const file = formData.get('avatar')
  if (!(file instanceof File) || file.size === 0) {
    return { errors: { avatar: 'AVATAR_REQUIRED' } }
  }

  const check = validateAvatarUpload({ size: file.size, type: file.type })
  if (!check.ok) return { errors: { avatar: check.error } }

  const bytes = new Uint8Array(await file.arrayBuffer())
  await updateAvatar(userId, bytes, file.type)
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function removeAvatarAction(): Promise<AccountFormState> {
  const userId = await requireUserId()
  if (!userId) return { errors: { form: 'NOT_SIGNED_IN' } }

  await removeAvatar(userId)
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function changePasswordAction(
  _prev: AccountFormState | undefined,
  formData: FormData,
): Promise<AccountFormState> {
  const userId = await requireUserId()
  if (!userId) return { errors: { form: 'NOT_SIGNED_IN' } }

  const result = validatePasswordChange({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
  })
  if (!result.ok) return { errors: result.errors }

  const changed = await changePassword(
    userId,
    result.data.currentPassword,
    result.data.newPassword,
  )
  if (!changed.ok) {
    return changed.reason === 'NO_PASSWORD'
      ? { errors: { form: 'NO_PASSWORD' } }
      : { errors: { currentPassword: 'WRONG_PASSWORD' } }
  }

  return { ok: true }
}

export async function deleteAccountAction(
  _prev: AccountFormState | undefined,
  formData: FormData,
): Promise<AccountFormState> {
  const locale = resolveLocale(formData)
  const user = await getCurrentUser()
  if (!user) return { errors: { form: 'NOT_SIGNED_IN' } }

  const confirm = formData.get('confirmEmail')
  const typed = typeof confirm === 'string' ? normalizeEmail(confirm) : ''
  if (typed !== normalizeEmail(user.email)) {
    return { errors: { confirmEmail: 'EMAIL_MISMATCH' } }
  }

  await deleteAccount(user.id)
  await signOut({ redirect: false })
  redirect({ href: '/', locale })
  throw new Error('redirect() did not halt execution')
}
