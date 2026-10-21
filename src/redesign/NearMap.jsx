import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { PLACES, placeById, EVENTS } from './catalog.js'
import { useApp } from '../app/AppContext.jsx'
import { IconButton, Symbol, countLabel, hasLargePhoto } from './ui.jsx'
import BasemapLayer from './BasemapLayer.jsx'
import MapSearchSheet from './MapSearchSheet.jsx'
import { CITY_CENTER } from './location.js'
import { eventPosition, wifiForPlace } from './mapData.js'

const LAYERS = [{ id: 'places', label: 'Места', hint: 'Места на карте', icon: 'place' }, { id: 'events', label: 'Афиша', hint: 'События на карте', icon: 'calendar_today' }, { id: 'wifi', label: 'Wi-Fi', hint: 'Места с Wi-Fi', icon: 'wifi' }]

function ExtraMarkers({ events, wifiPlaces, onEvent, onPlace, selectedId }) {
  const markers = useMemo(() => {
    const positions = new Map()
    return events.map(event => {
      const position = eventPosition(event)
      if (!position) return null
      const key = position.join(',')
      const index = positions.get(key) || 0
      positions.set(key, index + 1)
      return { event, position, icon: L.divIcon({
        className: 'near-event-pin', iconSize: [38, 38], iconAnchor: [19 - index * 44, 66],
        html: `<span><img src="${event.image}" alt="" draggable="false" /></span><i class="material-icons-outlined" aria-hidden="true">calendar_today</i>`,
      }) }
    }).filter(Boolean)
  }, [events])
  const wifiIcon = useMemo(() => L.divIcon({ className: 'near-wifi-pin', iconSize: [38, 38], iconAnchor: [62, 19], html: '<span class="material-icons-outlined" aria-hidden="true">wifi</span>' }), [])
  return <>{markers.map(({ event, position, icon }) => <Marker key={event.id} position={position} icon={icon} title={event.title} alt={event.title} zIndexOffset={1100} eventHandlers={{ click: () => onEvent(event) }}><Tooltip direction="top" offset={[0, -48]}>{event.title}<br />{event.date} · {event.time}</Tooltip></Marker>)}{wifiPlaces.map(place => <Marker key={place.id} position={[place.lat, place.lng]} icon={wifiIcon} title={`Wi-Fi: ${place.name}`} alt={`Wi-Fi: ${place.name}`} zIndexOffset={place.id === selectedId ? 1300 : 1200} eventHandlers={{ click: () => onPlace(place) }}><Tooltip direction="left" offset={[-40, 0]}>{place.name}{Number.isFinite(wifiForPlace(place).downloadMbps) && <><br />{wifiForPlace(place).downloadMbps} Мбит/с</>}</Tooltip></Marker>)}</>
}

function MapEvents({ onPick, onReady, places, fitToPlaces }) {
  const map = useMapEvents({ click: event => onPick?.(event.latlng) })
  useEffect(() => { onReady?.(map) }, [map, onReady])
  useEffect(() => {
    if (!fitToPlaces || !places.length) return
    const bounds = L.latLngBounds(places.map(place => [place.lat, place.lng]))
    map.fitBounds(bounds.pad(.12), { maxZoom: 14, paddingTopLeft: [45, 30], paddingBottomRight: [45, 230], animate: false })
  }, [map, places, fitToPlaces])
  return null
}

function MapMarkers({ places, onPlace, selectedId }) {
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) })
  const groups = useMemo(() => {
    const groups = []
    const ordered = [...places].sort((a, b) => Number(b.id === selectedId) - Number(a.id === selectedId))
    for (const place of ordered) {
      const point = map.project([place.lat, place.lng], zoom)
      const group = groups.find(group => group.places[0].id !== selectedId && group.point.distanceTo(point) < 48)
      if (group) group.places.push(place)
      else groups.push({ point, places: [place] })
    }
    return groups.map(group => {
      const place = group.places[0]
      const clustered = group.places.length > 1
      return { ...group, position: [place.lat, place.lng], icon: L.divIcon({
        className: `near-pin ${clustered ? 'near-pin--group' : ''} ${place.id === selectedId ? 'is-selected' : ''}`, iconSize: [38, 38], iconAnchor: [19, 19],
        html: `<span><img src="${place.pin}" alt="" draggable="false"></span>${clustered ? `<b>${group.places.length}</b>` : ''}`,
      }) }
    })
  }, [places, map, zoom, selectedId])
  return groups.map(group => {
    const place = group.places[0]
    const clustered = group.places.length > 1
    const label = clustered ? `${countLabel(group.places.length)}. Приблизить` : place.name
    return <Marker key={place.id} position={group.position} icon={group.icon} title={label} alt={label} zIndexOffset={place.id === selectedId ? 1000 : 0} eventHandlers={{ click: () => {
      if (clustered) map.fitBounds(group.places.map(place => [place.lat, place.lng]), { maxZoom: Math.min(19, zoom + 2), padding: [70, 90] })
      else onPlace?.(place)
    } }}><Tooltip key={`${place.id}-${place.id === selectedId}`} permanent={place.id === selectedId} direction="top" offset={[0, -18]}>{label}</Tooltip></Marker>
  })
}

function PhotoMap({ places, events = [], wifiPlaces = [], onEvent, onPlace, onPick, onReady, point, fitToPlaces = false, selectedId }) {
  const pointIcon = useMemo(() => L.divIcon({ className: 'near-point', iconSize: [20, 20] }), [])
  return <MapContainer className="near-map-canvas" center={CITY_CENTER} zoom={13} minZoom={3} maxZoom={19} zoomControl={false}>
    <BasemapLayer />
    <MapMarkers places={places} onPlace={onPlace} selectedId={selectedId} />
    <ExtraMarkers events={events} wifiPlaces={wifiPlaces} onEvent={onEvent} onPlace={onPlace} selectedId={selectedId} />
    {point && <Marker position={point} icon={pointIcon} />}
    <MapEvents onPick={onPick} onReady={onReady} places={places} fitToPlaces={fitToPlaces} />
  </MapContainer>
}

export default function NearMap({ location, sheetState, onSheetState, active, blocked }) {
  const { push } = useApp()
  const mapRef = useRef(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Все')
  const [selectedId, setSelectedId] = useState(null)
  const [layers, setLayers] = useState({ places: true, events: false, wifi: false })
  const [layersOpen, setLayersOpen] = useState(false)
  const [layerNotice, setLayerNotice] = useState('')
  const [layerHintsVisible, setLayerHintsVisible] = useState(false)
  const layerHintsSeen = useRef(false)
  const layersRef = useRef(null)
  useEffect(() => {
    if (!layerHintsVisible) return
    const timer = setTimeout(() => setLayerHintsVisible(false), 4800)
    return () => clearTimeout(timer)
  }, [layerHintsVisible])
  const toggleLayers = () => {
    onSheetState('compact')
    if (!layersOpen && !layerHintsSeen.current) {
      layerHintsSeen.current = true
      setLayerHintsVisible(true)
    } else setLayerHintsVisible(false)
    setLayersOpen(!layersOpen)
  }
  useEffect(() => {
    if (!layerNotice) return
    const timer = setTimeout(() => setLayerNotice(''), 2600)
    return () => clearTimeout(timer)
  }, [layerNotice])
  useEffect(() => {
    if (!layersOpen) return
    const dismiss = event => { if (!layersRef.current?.contains(event.target)) setLayersOpen(false) }
    const escape = event => { if (event.key === 'Escape') { setLayersOpen(false); layersRef.current?.querySelector('button')?.focus() } }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', dismiss); document.removeEventListener('keydown', escape) }
  }, [layersOpen])
  useEffect(() => { if (location) mapRef.current?.setView(location, 14, { animate: true }) }, [location])
  const places = useMemo(() => {
    const text = query.trim().toLowerCase().replaceAll('ё', 'е')
    return PLACES.filter(place => (category === 'Все' || category === place.category) && (!text || `${place.name} ${place.category} ${place.tags.join(' ')} ${place.description}`.toLowerCase().replaceAll('ё', 'е').includes(text))).sort((a, b) => Number(hasLargePhoto(b)) - Number(hasLargePhoto(a)))
  }, [query, category])
  const events = useMemo(() => EVENTS.filter(event => {
    if (!eventPosition(event)) return false
    const place = placeById(event.placeId)
    const text = query.trim().toLowerCase().replaceAll('ё', 'е')
    return (category === 'Все' || category === place?.category || category === event.category) && `${event.title} ${event.description} ${place?.name || ''}`.toLowerCase().replaceAll('ё', 'е').includes(text)
  }), [query, category])
  const wifiPlaces = useMemo(() => places.filter(wifiForPlace), [places])
  const toggleLayer = id => {
    const enabled = !layers[id]
    setLayers(value => ({ ...value, [id]: enabled }))
    setLayerNotice(enabled && id === 'wifi' && !wifiPlaces.length ? 'Пока нет данных Wi-Fi' : enabled && id === 'events' && !events.length ? 'По запросу нет событий' : '')
  }
  const centerOn = point => {
    onSheetState('compact')
    setLayersOpen(false)
    const map = mapRef.current
    if (!map) return
    const zoom = Math.max(map.getZoom(), 14)
    // Центрируем метку в видимой части карты над свёрнутой панелью.
    const center = map.unproject(map.project(point, zoom).add([0, 73]), zoom)
    map.setView(center, zoom, { animate: true })
  }
  const openPlace = place => {
    setSelectedId(place.id)
    // Выбор из каталога показывает место, даже если слой мест был выключен.
    setLayers(value => ({ ...value, places: true }))
    centerOn([place.lat, place.lng])
    push('place', place.id)
  }
  const openEvent = event => { centerOn(eventPosition(event)); push('event', event.id) }
  return <div className="near-map-screen">
    <header className="near-map-heading"><h1>Ростов-на-Дону</h1><button className="near-avatar" onClick={() => push('profile')} aria-label="Профиль"><img src="/img/avatar.jpg" alt="" /></button></header>
    <div className="near-map-area">
      <PhotoMap places={layers.places ? places : []} events={layers.events ? events : []} wifiPlaces={layers.wifi ? wifiPlaces : []} onEvent={openEvent} point={location} fitToPlaces={!!query.trim() || category !== 'Все'} selectedId={selectedId} onReady={map => { mapRef.current = map }} onPlace={openPlace} />
      <div ref={layersRef} className={`near-map-layers ${layersOpen ? 'is-open' : ''} ${layerHintsVisible ? 'has-hints' : ''}`}><IconButton label="Слои карты" icon="layers" aria-expanded={layersOpen} aria-controls="near-layer-options" title="Слои карты" onClick={toggleLayers}><Symbol name="layers" /><span className="near-layer-count">{Object.values(layers).filter(Boolean).length}</span></IconButton><section id="near-layer-options" className="near-layer-options" aria-label="Слои карты" aria-hidden={!layersOpen} inert={!layersOpen}>{LAYERS.map(item => <IconButton key={item.id} label={item.label} icon={item.icon} title={`${item.hint} — ${layers[item.id] ? 'включён' : 'выключен'}`} aria-pressed={layers[item.id]} onClick={() => toggleLayer(item.id)}><Symbol name={item.icon} /><span className="near-layer-hint" aria-hidden="true">{item.hint}</span></IconButton>)}</section></div>
      {layerNotice && <div className="near-layer-feedback" role="status">{layerNotice}</div>}
      <div className="near-map-controls"><IconButton icon="add" label="Приблизить карту" onClick={() => mapRef.current?.zoomIn()} /><IconButton icon="remove" label="Отдалить карту" onClick={() => mapRef.current?.zoomOut()} /><IconButton icon="my_location" label="Выбрать местоположение" onClick={() => push('locationPicker')} /></div>
      <MapSearchSheet places={places} query={query} onQuery={value => { setQuery(value); setSelectedId(null) }} category={category} onCategory={value => { setCategory(value); setSelectedId(null) }} state={sheetState} onState={onSheetState} selectedId={selectedId} onPlace={openPlace} active={active} blocked={blocked} />
    </div>
  </div>
}

export function LocationPicker({ onClose, onSelect }) {
  const [point, setPoint] = useState(null)
  const pickerRef = useRef(null)
  useEffect(() => {
    if (!pickerRef.current.closest('.near-app--nav-overlay')) return
    const credits = pickerRef.current.querySelector('.leaflet-control-attribution')
    if (!credits) return
    credits.inert = true
    credits.setAttribute('aria-hidden', 'true')
    return () => { credits.inert = false; credits.removeAttribute('aria-hidden') }
  }, [])
  return <div ref={pickerRef} className="near-location">
    <PhotoMap places={[]} point={point} onPick={latlng => setPoint([latlng.lat, latlng.lng])} />
    <button className="near-location-back near-button near-button--secondary" onClick={onClose}><Symbol name="chevron_left" />Назад</button>
    <div className="near-location-panel"><h2>Ваше местоположение</h2><p>{point ? 'Точка выбрана на карте' : 'Нажмите на карту, чтобы выбрать точку.'}</p><button className="near-button" disabled={!point} onClick={() => { onSelect(point); onClose() }}>Использовать эту точку</button></div>
  </div>
}
