/**
 * Pure input validation for the credentials auth forms. No database, no framework
 * imports — the boundary check that runs before `registerAction` / `loginAction`
 * touch Prisma or Auth.js. Errors are stable string codes the UI maps to `Auth`
 * messages, mirroring the guard style of `src/lib/filters.ts`.
 */

export const EMAIL_MAX = 254
export const PASSWORD_MIN = 8
/** bcrypt silently truncates at 72 bytes — reject longer input rather than hash a lie. */
export const PASSWORD_MAX = 72
export const NAME_MAX = 80

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase()
}

export function isValidEmail(value: string): boolean {
  return value.length <= EMAIL_MAX && EMAIL_PATTERN.test(value)
}

type RegistrationErrors = {
  email?: 'EMAIL_INVALID'
  password?: 'PASSWORD_TOO_SHORT' | 'PASSWORD_TOO_LONG'
  name?: 'NAME_TOO_LONG'
}

type RegistrationResult =
  | { ok: true; data: { email: string; password: string; name: string | null } }
  | { ok: false; errors: RegistrationErrors }

export function validateRegistration(input: {
  email: unknown
  password: unknown
  name: unknown
}): RegistrationResult {
  const errors: RegistrationErrors = {}

  const email = typeof input.email === 'string' ? normalizeEmail(input.email) : ''
  if (!isValidEmail(email)) errors.email = 'EMAIL_INVALID'

  const password = typeof input.password === 'string' ? input.password : ''
  if (password.length < PASSWORD_MIN) errors.password = 'PASSWORD_TOO_SHORT'
  else if (password.length > PASSWORD_MAX) errors.password = 'PASSWORD_TOO_LONG'

  const name = typeof input.name === 'string' ? input.name.trim() : ''
  if (name.length > NAME_MAX) errors.name = 'NAME_TOO_LONG'

  if (errors.email || errors.password || errors.name) return { ok: false, errors }

  return { ok: true, data: { email, password, name: name || null } }
}

type LoginErrors = {
  email?: 'EMAIL_INVALID'
  password?: 'PASSWORD_REQUIRED'
}

type LoginResult =
  | { ok: true; data: { email: string; password: string } }
  | { ok: false; errors: LoginErrors }

export function validateLogin(input: {
  email: unknown
  password: unknown
}): LoginResult {
  const errors: LoginErrors = {}

  const email = typeof input.email === 'string' ? normalizeEmail(input.email) : ''
  if (!isValidEmail(email)) errors.email = 'EMAIL_INVALID'

  const password = typeof input.password === 'string' ? input.password : ''
  if (password.length === 0) errors.password = 'PASSWORD_REQUIRED'

  if (errors.email || errors.password) return { ok: false, errors }

  return { ok: true, data: { email, password } }
}
