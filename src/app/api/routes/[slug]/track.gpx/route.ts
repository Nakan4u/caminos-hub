import type { NextRequest } from 'next/server'
import { getRouteTrack } from '@/lib/routes'
import { assembleRange } from '@/lib/track'
import { buildGpx, clampStageRange, gpxFilename } from '@/lib/gpx'

/**
 * GPX download for a whole route or a stage range: `?from=<order>&to=<order>`
 * (1-based, inclusive; omit either for the route end). Bad or missing params are
 * clamped, never rejected. One `<trkseg>` per stage; stages without OSM geometry
 * fall back to a straight marker-to-marker line.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params
  const track = await getRouteTrack(slug)
  if (!track || track.stages.length === 0) return new Response('Not found', { status: 404 })

  const params = req.nextUrl.searchParams
  const intParam = (v: string | null) => (v == null || v.trim() === '' ? undefined : Number(v))
  const { from, to } = clampStageRange(
    intParam(params.get('from')),
    intParam(params.get('to')),
    track.stages.length,
  )

  const { segments } = assembleRange(track.stages, from, to)
  if (segments.every((s) => s.coordinates.length < 2)) {
    return new Response('No track available', { status: 404 })
  }

  const whole = from === 1 && to === track.stages.length
  const xml = buildGpx({ routeName: track.nameEs, stages: segments })

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/gpx+xml',
      'Content-Disposition': `attachment; filename="${gpxFilename(slug, whole ? undefined : from, whole ? undefined : to)}"`,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
