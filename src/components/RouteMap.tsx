'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Map as LeafletMap, Polyline } from 'leaflet'
import type { MapStage } from '@/lib/track'
import 'leaflet/dist/leaflet.css'
import styles from './RouteMap.module.scss'

interface Props {
  slug: string
  routeNameEs: string
  stages: MapStage[]
}

type LngLat = [number, number]

// Waymarking yellow, Meseta granite, Camino red — all theme-invariant (see _tokens.scss).
const COLOR_REAL = '#e8a300'
const COLOR_FALLBACK = '#8b979d'
const COLOR_SELECTED = '#a8402f'

interface Boundary {
  index: number
  name: string
  coord: LngLat | null
}

interface TrackFeature {
  geometry: { type: 'LineString'; coordinates: LngLat[] }
  properties: { stageOrder: number; fallback: boolean }
}

/** Leaflet wants [lat, lng]; our data is [lng, lat]. */
const toLatLng = (c: LngLat): [number, number] => [c[1], c[0]]

export function RouteMap({ slug, routeNameEs, stages }: Props) {
  const t = useTranslations('RouteMap')
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const stageLayersRef = useRef<Map<number, { layer: Polyline; fallback: boolean }>>(new Map())
  const placeholderRef = useRef<Polyline | null>(null)
  const markersRef = useRef<{ index: number; el: HTMLElement }[]>([])

  const [loaded, setLoaded] = useState(false)
  const [approximate, setApproximate] = useState(false)
  const [selection, setSelection] = useState<{ a: number | null; b: number | null }>({
    a: null,
    b: null,
  })

  const boundaries = useMemo<Boundary[]>(() => {
    if (stages.length === 0) return []
    const list: Boundary[] = [{ index: 0, name: stages[0].fromPlace, coord: stages[0].from }]
    stages.forEach((s, i) => list.push({ index: i + 1, name: s.toPlace, coord: s.to }))
    return list
  }, [stages])

  const handleBoundaryClick = useCallback((index: number) => {
    setSelection((prev) => {
      if (prev.a == null || prev.b != null) return { a: index, b: null }
      return { a: prev.a, b: index }
    })
  }, [])

  const range = useMemo(() => {
    const { a, b } = selection
    if (a == null || b == null) return null
    const lo = Math.min(a, b)
    const hi = Math.max(a, b)
    if (lo === hi) return null
    return { fromStage: lo + 1, toStage: hi }
  }, [selection])

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return
    let cancelled = false

    void (async () => {
      const L = (await import('leaflet')).default
      if (cancelled || !containerRef.current || mapRef.current) return

      const map = L.map(containerRef.current, { scrollWheelZoom: false })
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map)

      const drawn = boundaries.map((b) => b.coord).filter((c): c is LngLat => c != null)
      if (drawn.length >= 2) {
        placeholderRef.current = L.polyline(drawn.map(toLatLng), {
          color: COLOR_FALLBACK,
          weight: 3,
          dashArray: '6 6',
        }).addTo(map)
        map.fitBounds(placeholderRef.current.getBounds(), { padding: [24, 24] })
      } else if (drawn.length === 1) {
        map.setView(toLatLng(drawn[0]), 12)
      } else {
        map.setView([42.5, -5], 6)
      }

      markersRef.current = []
      for (const b of boundaries) {
        if (!b.coord) continue
        const marker = L.marker(toLatLng(b.coord), {
          icon: L.divIcon({ className: styles.marker, iconSize: [16, 16], iconAnchor: [8, 8] }),
          title: b.name,
          keyboard: true,
        }).addTo(map)
        marker.on('click', () => handleBoundaryClick(b.index))
        const el = marker.getElement()
        if (el) markersRef.current.push({ index: b.index, el })
      }

      try {
        const res = await fetch(`/api/routes/${slug}/track`)
        if (cancelled || !res.ok) return
        const fc = (await res.json()) as { features: TrackFeature[] }
        let anyFallback = false
        for (const feat of fc.features) {
          if (feat.geometry.coordinates.length < 2) continue
          const fallback = feat.properties.fallback
          anyFallback ||= fallback
          const layer = L.polyline(feat.geometry.coordinates.map(toLatLng), {
            color: fallback ? COLOR_FALLBACK : COLOR_REAL,
            weight: 4,
            dashArray: fallback ? '6 6' : undefined,
          }).addTo(map)
          stageLayersRef.current.set(feat.properties.stageOrder, { layer, fallback })
        }
        if (placeholderRef.current && stageLayersRef.current.size > 0) {
          placeholderRef.current.remove()
          placeholderRef.current = null
        }
        setApproximate(anyFallback)
        setLoaded(true)
      } catch {
        // Network failed — the dashed placeholder stays; downloads still work.
      }
    })()

    const stageLayers = stageLayersRef.current
    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
      stageLayers.clear()
      placeholderRef.current = null
      markersRef.current = []
    }
    // Effect builds the map once from the initial props; stages don't change after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, handleBoundaryClick])

  // Restyle stage lines and markers whenever the selection changes.
  useEffect(() => {
    for (const [order, { layer, fallback }] of stageLayersRef.current) {
      const inRange = range != null && order >= range.fromStage && order <= range.toStage
      layer.setStyle({
        color: inRange ? COLOR_SELECTED : fallback ? COLOR_FALLBACK : COLOR_REAL,
        weight: inRange ? 6 : 4,
      })
    }
    const { a, b } = selection
    for (const { index, el } of markersRef.current) {
      el.classList.toggle(styles.markerActive, index === a || index === b)
    }
  }, [selection, range, loaded])

  if (stages.length === 0) return null

  return (
    <div className={styles.wrap}>
      <div ref={containerRef} className={styles.map} role="application" aria-label={routeNameEs} />

      <p className={styles.hint}>
        {!loaded ? t('loading') : range ? t('selectedStages', range) : t('selectHint')}
      </p>

      <div className={styles.actions}>
        <a className={styles.download} href={`/api/routes/${slug}/track.gpx`} download>
          {t('downloadWhole')}
        </a>
        {range && (
          <a
            className={styles.download}
            href={`/api/routes/${slug}/track.gpx?from=${range.fromStage}&to=${range.toStage}`}
            download
          >
            {t('downloadRange', range)}
          </a>
        )}
        {(selection.a != null || selection.b != null) && (
          <button
            type="button"
            className={styles.clear}
            onClick={() => setSelection({ a: null, b: null })}
          >
            {t('clearSelection')}
          </button>
        )}
      </div>

      {approximate && <p className={styles.note}>{t('approximateNotice')}</p>}
      <p className={styles.attribution}>{t('attribution')}</p>
    </div>
  )
}
