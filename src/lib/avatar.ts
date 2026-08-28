/**
 * Fallback avatar glyph — used when a user has no profile image (every
 * credentials account, and Google accounts that never set a picture).
 * Picks the first letter/digit of the display name, falling back to the
 * email, then to '?'. Pure; unit-tested in `src/__tests__/avatar.test.ts`.
 */
export function avatarInitial(
  name: string | null | undefined,
  email: string,
): string {
  for (const raw of [name, email]) {
    const trimmed = raw?.trim()
    if (!trimmed) continue
    const char = Array.from(trimmed).find((c) => /\p{L}|\p{N}/u.test(c))
    if (char) return char.toUpperCase()
  }
  return '?'
}
