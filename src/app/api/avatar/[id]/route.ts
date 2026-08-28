import type { NextRequest } from 'next/server'
import { getAvatarBytes } from '@/lib/users'

/**
 * Serves a user's uploaded avatar bytes. No auth check — avatars aren't secret
 * and the user id is already public in rendered HTML. The `?v=<mtime>` query the
 * caller appends makes the URL change whenever the image does, so the response
 * is safely immutable-cacheable. Outside `src/proxy.ts` (matcher excludes /api).
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params
  const avatar = await getAvatarBytes(id)
  if (!avatar) return new Response('Not found', { status: 404 })

  return new Response(avatar.data as BodyInit, {
    headers: {
      'Content-Type': avatar.type,
      'Content-Length': String(avatar.data.byteLength),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
