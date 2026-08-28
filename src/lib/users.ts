import 'server-only'
import bcrypt from 'bcryptjs'
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

/** The mutable identity fields plus whether each optional credential/avatar exists.
 *  `image` is the resolved avatar URL — the local avatar route when an upload
 *  exists, otherwise the stored (Google) URL, otherwise null. */
export type AccountSummary = {
  name: string | null
  email: string
  image: string | null
  hasPassword: boolean
  hasUploadedAvatar: boolean
}

export async function getAccountSummary(
  userId: string,
): Promise<AccountSummary | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      image: true,
      passwordHash: true,
      imageType: true,
      imageUpdatedAt: true,
    },
  })
  if (!user) return null

  const hasUploadedAvatar = user.imageType !== null
  const image = hasUploadedAvatar
    ? `/api/avatar/${userId}?v=${user.imageUpdatedAt?.getTime() ?? 0}`
    : user.image

  return {
    name: user.name,
    email: user.email,
    image,
    hasPassword: user.passwordHash !== null,
    hasUploadedAvatar,
  }
}

/** Raw uploaded avatar bytes for the `/api/avatar/[id]` route handler. */
export async function getAvatarBytes(
  userId: string,
): Promise<{ data: Uint8Array; type: string; updatedAt: Date } | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { imageData: true, imageType: true, imageUpdatedAt: true },
  })
  if (!user?.imageData || !user.imageType) return null
  return {
    data: user.imageData,
    type: user.imageType,
    updatedAt: user.imageUpdatedAt ?? new Date(0),
  }
}

export async function updateDisplayName(
  userId: string,
  name: string | null,
): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { name } })
}

export async function updateAvatar(
  userId: string,
  data: Uint8Array<ArrayBuffer>,
  type: string,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { imageData: data, imageType: type, imageUpdatedAt: new Date() },
  })
}

export async function removeAvatar(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { imageData: null, imageType: null, imageUpdatedAt: null },
  })
}

export type ChangePasswordResult =
  | { ok: true }
  | { ok: false; reason: 'NO_PASSWORD' | 'WRONG_PASSWORD' }

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<ChangePasswordResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  })
  if (!user?.passwordHash) return { ok: false, reason: 'NO_PASSWORD' }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!valid) return { ok: false, reason: 'WRONG_PASSWORD' }

  const passwordHash = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } })
  return { ok: true }
}

/** Hard-delete the account. `UserRoute`, `Account`, `Session` cascade. */
export async function deleteAccount(userId: string): Promise<void> {
  await prisma.user.delete({ where: { id: userId } })
}
