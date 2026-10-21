import { useEffect, useState } from 'react'
import { Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import Icon from '../../components/Icon.jsx'
import PlacesMap from './PlacesMap.jsx'
import { PICKER_PLACES } from './pinSets.js'
import { setLocated } from './locationStore.js'
import './LocationPicker.css'

const pointIcon = L.divIcon({
  className: 'locp-point',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  html: '<span class="locp-point__halo"></span><span class="locp-point__dot"></span>',
})

function TapLayer({ point, onPick }) {
  useMapEvents({ click: (e) => onPick([e.latlng.lat, e.latlng.lng]) })
  return point ? <Marker position={point} icon={pointIcon} interactive={false} keyboard={false} /> : null
}

export default function LocationPicker({ onClose }) {
  const [phase, setPhase] = useState('enter') // enter → open → exit
  const [point, setPoint] = useState(null)

  useEffect(() => { const id = requestAnimationFrame(() => setPhase('open')); return () => cancelAnimationFrame(id) }, [])

  const leave = (done) => {
    setPhase('exit')
    setTimeout(() => { if (done) setLocated(true); onClose() }, 260)
  }

  return (
    <div className={`locp-root ${phase === 'open' ? 'is-open' : ''}`}>
      <PlacesMap places={PICKER_PLACES}>
        <TapLayer point={point} onPick={setPoint} />
      </PlacesMap>

      <div className="locp-sheet" role="dialog">
        <div className="locp-handle" />
        <div className="locp-head">
          <div className="locp-icon"><Icon name="location_on" size={22} color="#fff" /></div>
          <div className="locp-head__text">
            <div className="locp-title">Выберите местоположение</div>
            <div className="locp-sub">Нажмите на карту или введите адрес</div>
          </div>
        </div>
        <label className="locp-search">
          <Icon name="search" size={24} color="var(--label-3)" />
          <input placeholder="Введите адрес..." />
        </label>
        {point && (
          <div className="locp-info">
            <Icon name="touch_app" variant="filled" size={22} color="#1E88E5" />
            <span>Точка выбрана на карте</span>
          </div>
        )}
        <div className="locp-btns">
          <button className="locp-btn locp-btn--cancel" onClick={() => leave(false)}>Отмена</button>
          <button className="locp-btn locp-btn--ok" onClick={() => leave(true)}>
            <Icon name="done_all" size={20} color="#fff" />
            <span>Готово</span>
          </button>
        </div>
      </div>
    </div>
  )
}
