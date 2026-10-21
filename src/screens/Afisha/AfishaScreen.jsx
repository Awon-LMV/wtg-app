import { useState } from 'react'
import Icon from '../../components/Icon.jsx'
import { useApp } from '../../app/AppContext.jsx'
import { AFISHA_CATEGORIES, EVENTS } from '../../data/events.js'
import EventCard from './EventCard.jsx'
import './AfishaScreen.css'

export default function AfishaScreen() {
  const { push } = useApp()
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('Все')
  const q = query.trim().toLowerCase()
  const list = EVENTS.filter((e) => (cat === 'Все' || e.category === cat) && (!q || e.title.toLowerCase().includes(q)))

  return (
    <div className="afisha">
      <div className="afisha__grid no-scrollbar">
        {list.map((e) => (
          <EventCard key={e.id} event={e} variant="afisha" onClick={() => push('place', e.placeId)} />
        ))}
      </div>
      <div className="afisha__head">
        <h1 className="afisha__title">Афиша</h1>
        <label className="afisha__search">
          <Icon name="search" size={17.5} color="#8E8E93" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск мероприятий" />
        </label>
        <div className="afisha__chips no-scrollbar">
          {AFISHA_CATEGORIES.map((c) => (
            <button key={c} type="button" className={`afisha__chip ${c === cat ? 'is-active' : ''}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
