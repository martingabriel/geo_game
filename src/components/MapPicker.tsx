'use client'

import { useEffect, useRef, useState } from 'react'
import type * as LeafletType from 'leaflet'

interface MapPickerProps {
  phase: 'guessing' | 'result'
  onPin?: (lat: number, lng: number) => void
  guessLat?: number
  guessLng?: number
  actualLat?: number
  actualLng?: number
}

export default function MapPicker({
  phase,
  onPin,
  guessLat,
  guessLng,
  actualLat,
  actualLng,
}: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletType.Map | null>(null)
  const leafRef = useRef<typeof LeafletType | null>(null)
  const guessMarkerRef = useRef<LeafletType.CircleMarker | null>(null)
  const resultLayersRef = useRef<Array<LeafletType.Layer>>([])

  // Signals that the async Leaflet import + map init has completed.
  // Including this in Effect 2's deps ensures the click handler is attached
  // even though the import resolves after Effect 2's first run.
  const [mapReady, setMapReady] = useState(false)

  // Keep onPin in a ref so the click handler always calls the latest version
  // without needing it in any dependency array
  const onPinRef = useRef(onPin)
  onPinRef.current = onPin

  // Keep guess coords in refs so the result phase can read the latest values
  // without guessLat/guessLng changes re-triggering Effect 2
  const guessLatRef = useRef(guessLat)
  guessLatRef.current = guessLat
  const guessLngRef = useRef(guessLng)
  guessLngRef.current = guessLng

  // ── Effect 1: initialise map once, clean up on unmount ──────────────────
  useEffect(() => {
    if (!containerRef.current) return

    let active = true

    import('leaflet').then((L) => {
      if (!active || !containerRef.current || mapRef.current) return

      // Fix Webpack-broken default icon paths
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        iconUrl: '/leaflet/marker-icon.png',
        shadowUrl: '/leaflet/marker-shadow.png',
      })

      const map = L.map(containerRef.current).setView([49.171, 17.472], 14)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      mapRef.current = map
      leafRef.current = L
      setMapReady(true) // ← triggers Effect 2 to re-run now that the map exists
    })

    return () => {
      active = false
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        leafRef.current = null
        guessMarkerRef.current = null
        resultLayersRef.current = []
      }
      setMapReady(false)
    }
  }, []) // runs once

  // ── Effect 2: sync map state with phase / coordinate props ───────────────
  // mapReady is in deps so this re-runs once Leaflet finishes loading
  useEffect(() => {
    const L = leafRef.current
    const map = mapRef.current
    if (!L || !map) return

    // Clear any result overlays from the previous round
    resultLayersRef.current.forEach((layer) => map.removeLayer(layer))
    resultLayersRef.current = []

    if (phase === 'guessing') {
      // Remove old guess marker so each round starts fresh
      if (guessMarkerRef.current) {
        map.removeLayer(guessMarkerRef.current)
        guessMarkerRef.current = null
      }
      map.getContainer().style.cursor = 'crosshair'
      map.setView([49.171, 17.472], 14)

      const handleClick = (e: LeafletType.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng
        if (guessMarkerRef.current) {
          guessMarkerRef.current.setLatLng([lat, lng])
        } else {
          guessMarkerRef.current = L.circleMarker([lat, lng], {
            radius: 10,
            fillColor: '#3b82f6',
            color: '#ffffff',
            weight: 3,
            opacity: 1,
            fillOpacity: 1,
          }).addTo(map)
        }
        onPinRef.current?.(lat, lng)
      }

      map.on('click', handleClick)
      return () => {
        map.off('click', handleClick)
      }
    }

    if (
      phase === 'result' &&
      guessLatRef.current != null &&
      guessLngRef.current != null &&
      actualLat != null &&
      actualLng != null
    ) {
      const gLat = guessLatRef.current
      const gLng = guessLngRef.current
      map.getContainer().style.cursor = ''

      const actualMarker = L.circleMarker([actualLat, actualLng], {
        radius: 12,
        fillColor: '#22c55e',
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 1,
      })
        .addTo(map)
        .bindPopup('📍 Správné místo')
        .openPopup()

      const polyline = L.polyline(
        [
          [gLat, gLng],
          [actualLat, actualLng],
        ],
        { color: '#ef4444', dashArray: '8 8', weight: 3, opacity: 0.9 }
      ).addTo(map)

      resultLayersRef.current = [actualMarker, polyline]

      const bounds = L.latLngBounds([gLat, gLng], [actualLat, actualLng])
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 18 })
    }
    // guessLat/guessLng intentionally omitted — read from refs to avoid
    // re-running this effect (and removing the marker) on every pin placement
  }, [mapReady, phase, actualLat, actualLng])

  return (
    <div
      ref={containerRef}
      className="h-[37vh] min-h-[180px] w-full rounded-xl overflow-hidden"
    />
  )
}
