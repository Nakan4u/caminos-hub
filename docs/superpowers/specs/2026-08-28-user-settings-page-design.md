# User settings page — design

Date: 2026-08-28

## Goal

A `/settings` page for signed-in users to:

1. Edit their **display name**.
2. Upload / remove a profile **avatar** (bytes stored in Postgres).
3. Change their **password** (credentials accounts only).
4. **Delete** their account.

## Decisions (from brainstorming)

- Avatar files are **uploaded** and stored **as bytes in Postgres** — no external
  object storage, keeping the app's "no external services" property.
- Because a data URI cannot ride in the JWT cookie (4 KB limit), `getCurrentUser`
  switches from trusting the JWT for `name`/`image` to **one `cache()`-deduped DB
  read per request** for `{ name, image, hasPassword }`. `id`/`email` still come
  from the JWT with no DB hit. Result: name/avatar edits show immediately.
- Google-only accounts (no `passwordHash`): the password section is **hidden**,
  replaced by a "You sign in with Google" line.
- Delete requires typing the account email to arm the button, then sign out +
  redirect to `/`.
- Uploads: PNG / JPEG / WebP, **max 1 MB**, validated in the pure layer. Stored
  as-is, no server-side resizing (no image library).

## Schema change

Migration `add_user_avatar_bytes` — additive, three nullable columns on `User`:

```prisma
imageData      Bytes?
imageType      String?     // MIME type of imageData
imageUpdatedAt DateTime?   // cache-bust key for the avatar route
```

`image String?` stays — it holds the Google profile-picture URL. Resolution
order for a user's avatar: `imageData` present → local avatar route; else
`image` (Google URL); else none → initial glyph (existing `Avatar` fallback).

No re-seed needed (additive, `User` not seeded).

## Modules

### Pure — `src/lib/account-validation.ts` (+ `src/__tests__/account-validation.test.ts`)

Mirrors `auth-validation.ts` style: no DB, no framework, stable string-code errors.

- `validateDisplayName(input: unknown)` → `{ ok, data: { name: string | null } }` |
  `{ ok: false, error: 'NAME_TOO_LONG' }`. Reuses `NAME_MAX`.
- `validatePasswordChange(input: { currentPassword, newPassword })` → checks
  `newPassword` against `PASSWORD_MIN` / `PASSWORD_MAX`, `currentPassword`
  non-empty, and `newPassword !== currentPassword`. Errors:
  `CURRENT_REQUIRED`, `PASSWORD_TOO_SHORT`, `PASSWORD_TOO_LONG`, `SAME_PASSWORD`.
- `AVATAR_MAX_BYTES = 1_048_576`, `AVATAR_TYPES = ['image/png','image/jpeg','image/webp']`.
- `validateAvatarUpload(input: { size: number; type: string })` → errors
  `AVATAR_TOO_LARGE`, `AVATAR_TYPE`. (Byte-level magic-number sniffing is out of
  scope; we trust the browser-reported type for this low-risk feature.)

### Server-only — extend `src/lib/users.ts`

- `getAccountSettings(userId)` → `{ name: string | null; hasAvatar: boolean;
  hasPassword: boolean }` for the page.
- `getAvatarBytes(userId)` → `{ data: Uint8Array; type: string; updatedAt: Date } | null`
  for the route handler.
- `updateDisplayName(userId, name: string | null)`.
- `updateAvatar(userId, data: Uint8Array, type: string)` — also sets
  `imageUpdatedAt = new Date()`.
- `removeAvatar(userId)` — nulls `imageData`, `imageType`, `imageUpdatedAt`.
- `changePassword(userId, currentPassword, newPassword)` → verifies current hash
  with `bcrypt.compare`, writes new hash. Returns
  `{ ok: true } | { ok: false; reason: 'NO_PASSWORD' | 'WRONG_PASSWORD' }`.
- `deleteAccount(userId)` — `prisma.user.delete`; `UserRoute` / `Account` /
  `Session` cascade already.

### `getCurrentUser` — `src/lib/auth-dal.ts`

Now reads the user row (cached). `CurrentUser` gains `hasPassword: boolean`;
`image` becomes the resolved avatar URL:

- `imageUpdatedAt` set → `/api/avatar/${id}?v=${imageUpdatedAt.getTime()}`
- else `image` (Google URL) or `null`

If the user row is gone (deleted mid-session), return `null`.

### Route handler — `src/app/api/avatar/[id]/route.ts`

`GET` → `getAvatarBytes(id)`; 404 if none. Responds with the bytes,
`Content-Type: <imageType>`, `Cache-Control: public, max-age=31536000, immutable`
(safe because the URL carries the `?v=` mtime). No auth check — avatars are not
secret and the id is already public in page HTML. Outside the next-intl proxy
matcher (which already excludes `/api`).

### Actions — `src/lib/actions/account.ts` (`'use server'`)

Each re-resolves the session via `getCurrentUser` / `requireUser` (a Server
Action is a public endpoint), then: pure-validate → `users.ts` → `revalidatePath`
the settings page and `/` chrome as needed.

- `updateNameAction(prev, formData)` → `AccountFormState`.
- `updateAvatarAction(prev, formData)` — reads `formData.get('avatar') as File`,
  `validateAvatarUpload({ size, type })`, `await file.arrayBuffer()` →
  `updateAvatar`.
- `removeAvatarAction()`.
- `changePasswordAction(prev, formData)` — 403-equivalent (`NO_PASSWORD` error)
  if the account has no password; maps `WRONG_PASSWORD`.
- `deleteAccountAction(prev, formData)` — requires `formData.get('confirmEmail')`
  to equal the session email (normalized); on success `signOut({ redirect:false })`
  then `redirect({ href: '/', locale })`.

State shape: `{ errors?: Record<string,string>; ok?: true }`, one per form.

### UI

- `src/app/[locale]/settings/page.tsx` — Server Component. `requireUser(locale)`,
  `getAccountSettings`, `getTranslations('Settings')`. Renders section cards.
- Client form components (each `useActionState`, Bootstrap classes + a
  `*.module.scss`, matching `AuthForm`):
  - `ProfileForm` — name + avatar preview (`Avatar`), file input, Save + Remove.
  - `PasswordForm` — current / new password. Rendered only when `hasPassword`.
  - `DeleteAccountForm` — email-confirm input + destructive button.
- `AuthMenu` gets a "Settings" link next to "My routes".
- New `Settings` namespace in `messages/en.json` and `messages/uk.json`
  (English strings copied to `uk.json` as the fallback, per project norm — only
  two routes have real UK content).

## Testing

- `account-validation.test.ts` — full coverage of the three pure validators
  (name length, password rules incl. `SAME_PASSWORD`, avatar size/type).
- Existing suite stays green; `getCurrentUser` has no unit test today and the DB
  read keeps it that way (it's `server-only`).
- Manual: upload/remove avatar, change password happy + wrong-current path,
  delete with wrong/right email, Google account hides password section.

## Out of scope

Image cropping/resizing, multiple avatars, email change, 2FA, "download my
data", audit log, rate limiting.
