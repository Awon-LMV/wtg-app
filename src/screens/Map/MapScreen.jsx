import { useMemo, useRef, useState } from 'react'
import Icon from '../../components/Icon.jsx'
import { useApp } from '../../app/AppContext.jsx'
import { MAP_CATEGORIES, PLACES } from '../../data/places.js'
import PlacesMap from './PlacesMap.jsx'
import { MAP_CENTER, MAP_PLACES, MAP_ZOOM } from './pinSets.js'
import { useLocated } from './locationStore.js'
import './MapScreen.css'

export default function MapScreen() {
  const { push, stack } = useApp()
  const mapRef = useRef(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Все')
  const [pill, setPill] = useState(true)
  const located = useLocated()
  const modalOpen = stack.some((o) => o.type === 'locationModal' || o.type === 'locationPicker')

  const places = useMemo(() => {
    const q = query.trim().toLowerCase()
    // по умолчанию — набор пинов как на референсе; поиск и категории работают по всем местам
    if (!q && category === 'Все') return MAP_PLACES
    return PLACES.filter((p) => (category === 'Все' || p.category === category) && (!q || p.name.toLowerCase().includes(q)))
  }, [query, category])

  return (
    <div className="map-root">
      <PlacesMap ref={mapRef} places={places} onPlace={(p) => push('place', p.id)} />

      <button className="map-avatar" onClick={() => push('profile')} aria-label="Профиль">
        <img src="/img/avatar.jpg" alt="" />
      </button>

      {pill && !located && !modalOpen && (
        <div className="map-pill">
          <button className="map-pill__main" onClick={() => push('locationModal')}>
            <Icon name="my_location" size={14} color="var(--md-blue-locate)" />
            <span>Уточнить</span>
            <Icon name="chevron_right" size={14} color="#8E8E93" />
          </button>
          <button className="map-pill__close" onClick={() => setPill(false)} aria-label="Скрыть">
            <Icon name="close" size={14} color="#8E8E93" />
          </button>
        </div>
      )}

      <button className="map-layers" aria-label="Слои">
        <Icon name="layers" size={26} color="var(--label-2)" />
        <span className="map-layers__badge">1</span>
      </button>

      <div className="map-zoom">
        <button onClick={() => mapRef.current?.zoomIn()} aria-label="Приблизить"><Icon name="add" size={24} color="var(--label-2)" /></button>
        <button onClick={() => mapRef.current?.zoomOut()} aria-label="Отдалить"><Icon name="remove" size={24} color="var(--label-2)" /></button>
        <button onClick={() => mapRef.current?.setView(MAP_CENTER, MAP_ZOOM, { animate: true })} aria-label="Моё местоположение">
          <Icon name="my_location" size={24} color="var(--md-blue-locate)" />
        </button>
      </div>

      <div className="map-panel">
        <div className="map-panel__handle" />
        <div className="map-panel__row">
          <label className="map-search">
            <Icon name="search" size={24} color="var(--label-3)" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск мест..." />
          </label>
          <button className="map-wtg" onClick={() => push('wtg')}>
            <Icon name="auto_awesome" size={20} color="#fff" />
            <span>WTG</span>
          </button>
        </div>
        <div className="map-chips no-scrollbar">
          {MAP_CATEGORIES.map((c) => (
            <button key={c} className={`map-chip ${c === category ? 'is-active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
