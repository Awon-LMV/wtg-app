// Раскладка пинов как на референсах. Координаты данных в places.js не образуют настоящую карту,
// поэтому позиции пинов задаются в пикселях первого экрана (координаты скриншота reference/*.png)
// и переводятся в lat/lng через проекцию Leaflet. Дальше пины привязаны к карте и двигаются вместе с ней.
import L from 'leaflet'
import { PLACES } from '../../data/places.js'

export const MAP_CENTER = [47.2370, 39.7215]
export const MAP_ZOOM = 12
const K = 1.677
const SCREEN_CENTER = [195, 422]

// reference/01-map.png — набор пинов на вкладке «Карта»
const XY_MAP = {
  sicilia: [125, 105], 'park-gl': [352, 260], 'dve-rulki': [229, 303], neolit: [440, 363], sadzhio: [200, 435],
  avers: [136, 543], megacentr: [258, 536], mnogofun: [512, 590], boroda: [176, 680], subway: [425, 676],
  ploshad: [113, 824], 'baba-lyuba': [241, 812], megamag: [291, 936], 'staroe-mesto': [427, 882], goluboe: [510, 990],
}
// reference/03-location-picker.png — набор пинов в выборе местоположения
const XY_PICKER = {
  sicilia: [125, 105], 'park-im': [50, 187], 'park-gl': [352, 260], 'dve-rulki': [229, 303], merkur: [551, 312],
  neolit: [440, 363], sadzhio: [200, 435], megacentr: [258, 536], berlin: [158, 578], biblioteka: [475, 580],
  subway: [425, 676], 'tc-mille': [187, 713], 'dom-kino': [342, 750], rostovsk: [475, 750], skver: [32, 773],
  ploshad: [113, 824], 'baba-lyuba': [241, 812], obliko: [360, 870], zabrosh: [535, 832],
}

const crs = L.CRS.EPSG3857
const origin = crs.latLngToPoint(L.latLng(MAP_CENTER), MAP_ZOOM)
const xyToLatLng = ([x, y]) => {
  const p = origin.add([x / K - SCREEN_CENTER[0], y / K - SCREEN_CENTER[1]])
  const ll = crs.pointToLatLng(p, MAP_ZOOM)
  return [ll.lat, ll.lng]
}

export const pinLatLng = (p) => {
  const xy = XY_MAP[p.id] || XY_PICKER[p.id]
  return xy ? xyToLatLng(xy) : [p.lat, p.lng]
}

const pick = (xy) => PLACES.filter((p) => xy[p.id])
export const MAP_PLACES = pick(XY_MAP)
export const PICKER_PLACES = pick(XY_PICKER)
