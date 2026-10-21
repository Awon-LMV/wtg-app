import { useLayoutEffect, useRef, useState } from 'react'
import { placeById } from '../../data/places.js'
import Icon from '../../components/Icon.jsx'
import './EventCard.css'

const canvas = document.createElement('canvas').getContext('2d')

// Текст в две строки как во Flutter (maxLines: 2, ellipsis): первая строка переносится по словам,
// остаток уходит во вторую и обрезается «...» посреди слова (CSS line-clamp так не умеет).
function TwoLines({ text, className }) {
  const ref = useRef(null)
  const [lines, setLines] = useState([text])

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const measure = () => {
      const cs = getComputedStyle(el)
      canvas.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
      const ls = parseFloat(cs.letterSpacing) || 0
      const w = (s) => canvas.measureText(s).width + ls * s.length
      const avail = el.clientWidth
      if (w(text) <= avail) { setLines([text]); return }
      const words = text.split(' ')
      let first = words[0]
      let i = 1
      while (i < words.length - 1 && w(`${first} ${words[i]}`) <= avail) { first += ` ${words[i]}`; i++ }
      setLines([first, words.slice(i).join(' ')])
    }
    measure()
    document.fonts?.ready.then(measure)
    return undefined
  }, [text])

  return (
    <div ref={ref} className={className}>
      {lines.map((l, i) => <div key={i} className="ellipsis">{l}</div>)}
    </div>
  )
}

// Карточка события: variant 'afisha' (бейдж тёмный, с описанием) | 'collection' (бейдж белый, без описания).
export default function EventCard({ event, variant = 'afisha', onClick }) {
  const place = placeById(event.placeId)
  return (
    <button type="button" className={`evc evc--${variant}`} onClick={onClick}>
      <div className="evc__media"><img src={event.image} alt="" draggable={false} /></div>
      <div className="evc__shade" />
      <div className="evc__badge">
        <span>{event.time}</span>
        <span>{event.date}</span>
      </div>
      <div className="evc__body">
        <TwoLines className="evc__title" text={event.title} />
        {variant === 'afisha' && <TwoLines className="evc__desc" text={event.description} />}
        <div className="evc__place">
          <Icon name="location_on" size={11} color="#64B5F6" />
          <span className="ellipsis">{place ? place.name : ''}</span>
        </div>
      </div>
    </button>
  )
}

// Карточка места (шторка «Избранное» / пользовательская подборка): фото на всю карточку, имя и категория.
export function PlaceCard({ place, onClick }) {
  return (
    <button type="button" className="evc evc--place" onClick={onClick}>
      <img className="evc__cover" src={place.photo} alt="" draggable={false} />
      <div className="evc__shade" />
      <div className="evc__body">
        <TwoLines className="evc__title" text={place.name} />
        <div className="evc__cat ellipsis">{place.category}</div>
      </div>
    </button>
  )
}
