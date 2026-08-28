'use server'

import { AuthError } from 'next-auth'
import { hasLocale } from 'next-intl'
import { Prisma } from '@/generated/prisma/client'
import bcrypt from 'bcryptjs'
import { signIn, signOut } from '@/auth'
import { prisma } from '@/lib/prisma'
import { validateLogin, validateRegistration } from '@/lib/auth-validation'
import { routing } from '@/i18n/routing'
import { redirect } from '@/i18n/navigation'

export type AuthFormState = {
  errors?: {
    name?: string
    email?: string
    password?: string
    form?: string
  }
  values?: { name?: string; email?: string }
}

function resolveLocale(formData: FormData): string {
  const raw = formData.get('locale')
  return typeof raw === 'string' && hasLocale(routing.locales, raw)
    ? raw
    : routing.defaultLocale
}

/** A safe, same-origin relative path or `/my-routes` as the fallback landing spot. */
function resolveCallbackPath(formData: FormData): string {
  const raw = formData.get('callbackUrl')
  if (typeof raw === 'string' && raw.startsWith('/') && !raw.startsWith('//')) {
    return raw
  }
  return '/my-routes'
}

export async function registerAction(
  _prevState: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const locale = resolveLocale(formData)

  const result = validateRegistration({
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name'),
  })

  const values = {
    email: typeof formData.get('email') === 'string' ? String(formData.get('email')) : '',
    name: typeof formData.get('name') === 'string' ? String(formData.get('name')) : '',
  }

  if (!result.ok) return { errors: result.errors, values }

  const { email, password, name } = result.data
  const passwordHash = await bcrypt.hash(password, 10)

  try {
    await prisma.user.create({ data: { email, name, passwordHash } })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { errors: { email: 'EMAIL_TAKEN' }, values }
    }
    throw error
  }

  try {
    await signIn('credentials', { email, password, redirect: false })
  } catch (error) {
    if (error instanceof AuthError) return { errors: { form: 'SIGNIN_FAILED' }, values }
    throw error
  }

  redirect({ href: '/my-routes', locale })
  throw new Error('redirect() did not halt execution')
}

export async function loginAction(
  _prevState: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const locale = resolveLocale(formData)
  const callbackPath = resolveCallbackPath(formData)

  const result = validateLogin({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  const values = {
    email: typeof formData.get('email') === 'string' ? String(formData.get('email')) : '',
  }

  if (!result.ok) return { errors: result.errors, values }

  try {
    await signIn('credentials', {
      email: result.data.email,
      password: result.data.password,
      redirect: false,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { errors: { form: 'INVALID_CREDENTIALS' }, values }
    }
    throw error
  }

  redirect({ href: callbackPath, locale })
  throw new Error('redirect() did not halt execution')
}

export async function logoutAction(locale: string): Promise<void> {
  await signOut({ redirect: false })
  redirect({ href: '/', locale })
}

export async function googleSignInAction(locale: string): Promise<void> {
  await signIn('google', { redirectTo: `/${locale}/my-routes` })
}
