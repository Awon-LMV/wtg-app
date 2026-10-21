import { EVENTS, placeById } from './catalog.js'

// Wi-Fi is opt-in data, not inferred from a venue category or a missing value.
// Schema: place.wifi = { downloadMbps, uploadMbps, pingMs, measuredAt, networkName }.
export function wifiForPlace(place) {
  const wifi = place?.wifi
  if (!wifi || typeof wifi !== 'object') return null
  return ['downloadMbps', 'uploadMbps', 'pingMs'].some(key => Number.isFinite(wifi[key]) && wifi[key] >= 0) ? wifi : null
}

export function eventPosition(event) {
  if (Number.isFinite(event.lat) && Number.isFinite(event.lng)) return [event.lat, event.lng]
  const place = placeById(event.placeId)
  return place ? [place.lat, place.lng] : null
}

export function eventsForPlace(id) {
  const ids = placeById(id)?.events || []
  return EVENTS.filter(event => event.placeId === id || ids.includes(event.id))
}
