import type { NextRequest } from 'next/server'
import { getRouteTrack } from '@/lib/routes'
import { toFeatureCollection } from '@/lib/track'

/**
 * Per-stage trail geometry for a route, as a GeoJSON FeatureCollection (one
 * LineString per stage, `properties.stageOrder` + `fallback`). Fetched by the
 * `RouteMap` client island after mount so the route-detail HTML stays small.
 * Outside `src/proxy.ts` (matcher excludes `/api`), so no locale prefix.
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params
  const track = await getRouteTrack(slug)
  if (!track) return new Response('Not found', { status: 404 })

  return Response.json(toFeatureCollection(track.stages), {
    headers: {
      'Content-Type': 'application/geo+json',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
