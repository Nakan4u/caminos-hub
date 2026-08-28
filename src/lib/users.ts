import 'server-only'
import { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'

/**
 * User-account data access. Keeps the credentials-signup write off the action
 * layer so `src/lib/actions/auth.ts` stays free of Prisma imports, matching the
 * `routes.ts` / `user-routes.ts` split.
 */

export type CreateCredentialsUserResult = { ok: true } | { ok: false; reason: 'EMAIL_TAKEN' }

/** Create an email + password user. Returns `EMAIL_TAKEN` instead of throwing when
 *  the unique-email constraint (P2002) trips, so the caller can map it to a field error. */
export async function createCredentialsUser(input: {
  email: string
  name: string | null
  passwordHash: string
}): Promise<CreateCredentialsUserResult> {
  try {
    await prisma.user.create({ data: input })
    return { ok: true }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return { ok: false, reason: 'EMAIL_TAKEN' }
    }
    throw error
  }
}
