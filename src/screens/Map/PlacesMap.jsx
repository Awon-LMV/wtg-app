import { forwardRef, useMemo } from 'react'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { MAP_CENTER, MAP_ZOOM, pinLatLng } from './pinSets.js'
import './PlacesMap.css'

// CARTO Voyager теперь требует API-ключ (водяной знак), поэтому стандартные тайлы OSM
const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIBUTION = '&copy; OpenStreetMap'

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
// Подпись пина обрезается по символам, как в оригинале («Две Руль...»)
const shortName = (n) => (n.length > 8 ? n.slice(0, 8) + '...' : n)

const makeIcon = (p) => L.divIcon({
  className: 'map-pin',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  html: `<span class="map-pin__photo"><img src="${p.pin}" alt="" draggable="false"></span><span class="map-pin__label">${esc(shortName(p.name))}</span>`,
})

// Leaflet-карта с пинами мест. children — слои поверх (например, точка выбора).
const PlacesMap = forwardRef(function PlacesMap({ places, onPlace, children }, ref) {
  const icons = useMemo(() => Object.fromEntries(places.map((p) => [p.id, makeIcon(p)])), [places])
  return (
    <MapContainer ref={ref} className="places-map" center={MAP_CENTER} zoom={MAP_ZOOM} zoomControl={false} attributionControl>
      <TileLayer url={TILES} attribution={ATTRIBUTION} maxZoom={19} />
      {places.map((p) => (
        <Marker
          key={p.id}
          position={pinLatLng(p)}
          icon={icons[p.id]}
          interactive={!!onPlace}
          keyboard={false}
          eventHandlers={onPlace ? { click: () => onPlace(p) } : undefined}
        />
      ))}
      {children}
    </MapContainer>
  )
})

export default PlacesMap
