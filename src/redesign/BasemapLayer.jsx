import { useEffect, useRef, useState } from 'react'
import { TileLayer, useMap } from 'react-leaflet'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/bright'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
const MAPBOX_TILES = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`
const MAPBOX_ATTRIBUTION = '<a class="near-mapbox-logo" href="https://www.mapbox.com/" target="_blank" rel="noopener noreferrer"><img src="/img/mapbox-logo.svg" width="85" height="21" alt="Mapbox" /></a>© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> <a href="https://apps.mapbox.com/feedback/" target="_blank" rel="noopener noreferrer">Improve this map</a>'

export function MapCredits({ visible, covered = false }) {
  if (!visible || !MAPBOX_TOKEN) return null
  return <aside className="near-map-credits" aria-label="Источники карты" inert={covered} aria-hidden={covered || undefined}><a href="https://www.mapbox.com/" target="_blank" rel="noreferrer"><img src="/img/mapbox-logo.svg" width="85" height="21" alt="Mapbox" /></a><span>© <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noreferrer">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a><br /><a href="https://apps.mapbox.com/feedback/" target="_blank" rel="noreferrer">Improve this map</a></span></aside>
}

// Токен pk.* публичный: в браузере он виден всё равно. Лежит в .env.local (не в git).
// Без токена остаётся векторная подложка OpenFreeMap.
export default function BasemapLayer() {
  if (MAPBOX_TOKEN) return <MapboxBasemap />
  return <VectorBasemap />
}

function MapboxBasemap() {
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0)
  const failed = useRef(false)
  return <><TileLayer key={attempt} url={MAPBOX_TILES} tileSize={512} zoomOffset={-1} maxZoom={19} attribution={MAPBOX_ATTRIBUTION} eventHandlers={{ loading: () => { failed.current = false }, tileerror: () => { failed.current = true; setStatus('error') }, load: () => setStatus(failed.current ? 'error' : 'ready') }} />{status !== 'ready' && <div className={`near-basemap-status ${status === 'error' ? 'is-error' : ''}`} role="status">{status === 'error' ? <><span>Не удалось загрузить карту</span><button onClick={() => { failed.current = false; setStatus('loading'); setAttempt(value => value + 1) }}>Повторить</button></> : 'Загрузка карты…'}</div>}</>
}

function VectorBasemap() {
  const map = useMap()
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    let layer
    let timer

    Promise.all([import('@maplibre/maplibre-gl-leaflet'), import('maplibre-gl')]).then(([{ maplibreGL }, { setWorkerUrl }]) => {
      if (cancelled) return
      setWorkerUrl(workerUrl)
      layer = maplibreGL({ style: MAP_STYLE, interactive: false, renderWorldCopies: false }).addTo(map)
      const vectorMap = layer.getMaplibreMap()
      vectorMap.on('style.load', () => {
        // Убираем дублирование русских названий латиницей; номера трасс не меняем.
        for (const item of vectorMap.getStyle().layers) {
          if (item.type === 'symbol' && JSON.stringify(item.layout?.['text-field'] ?? '').includes('name')) {
            vectorMap.setLayoutProperty(item.id, 'text-field', ['coalesce', ['get', 'name:ru'], ['get', 'name'], ['get', 'name:nonlatin'], ['get', 'name:latin']])
          }
        }
      })
      vectorMap.once('load', () => { if (!cancelled) { clearTimeout(timer); setStatus('ready') } })
      timer = setTimeout(() => { if (!cancelled && !vectorMap.loaded()) setStatus('error') }, 20000)
    }).catch(() => { if (!cancelled) setStatus('error') })

    return () => {
      cancelled = true
      clearTimeout(timer)
      if (layer && map.hasLayer(layer)) map.removeLayer(layer)
    }
  }, [map, attempt])

  if (status === 'ready') return null
  return <div className={`near-basemap-status ${status === 'error' ? 'is-error' : ''}`} role="status">{status === 'error' ? <><span>Не удалось загрузить карту</span><button onClick={() => { setStatus('loading'); setAttempt(value => value + 1) }}>Повторить</button></> : 'Загрузка карты…'}</div>
}
