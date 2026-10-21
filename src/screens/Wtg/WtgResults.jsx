import { useEffect, useRef, useState } from 'react'
import Icon from '../../components/Icon.jsx'
import { useApp } from '../../app/AppContext.jsx'
import { PLACES, placeById } from '../../data/places.js'
import './WtgResults.css'

const FIRST = ['staroe-mesto', 'amarcord', 'flash-royal']
const DECK = [...FIRST.map(placeById), ...PLACES.filter((p) => !FIRST.includes(p.id))].filter(Boolean)
// у остальных мест фото мелкие (метки карты) — подставляем крупные снимки
const BIG_PHOTOS = ['/img/staroe-mesto.jpg', '/img/amarcord.jpg', '/img/ev-vinokur.jpg', '/img/ev-medved.jpg', '/img/ev-shlagbaum.jpg', '/img/ev-chgk.jpg']
const photoOf = (p, i) => (i < FIRST.length ? p.photo : BIG_PHOTOS[i % BIG_PHOTOS.length])
const matchOf = (i) => (i === 0 ? 35 : 55 + ((i * 17) % 41))
const THRESHOLD = 120

export default function WtgResults({ onClose, push }) {
  const { closeAll, wantToGo, toggleWantToGo } = useApp()
  const [i, setI] = useState(0)
  const [dx, setDx] = useState(0)
  const [anim, setAnim] = useState(false) // плавное движение (пружина / вылет)
  const [shown, setShown] = useState(false)
  const st = useRef(null)

  useEffect(() => { const id = requestAnimationFrame(() => setShown(true)); return () => cancelAnimationFrame(id) }, [])

  const place = DECK[i % DECK.length]
  const idx = i % DECK.length

  const onDown = (e) => {
    if (anim) return
    st.current = { x: e.clientX, y: e.clientY, moved: false }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onMove = (e) => {
    const s = st.current
    if (!s) return
    const d = e.clientX - s.x
    if (Math.abs(d) > 6) s.moved = true
    if (s.moved) setDx(d)
  }
  const fly = (dir) => {
    setAnim(true)
    setDx(dir * 460)
    setTimeout(() => {
      if (dir > 0 && !wantToGo.includes(place.id)) toggleWantToGo(place.id)
      setAnim(false); setDx(0); setI((n) => n + 1)
    }, 260)
  }
  const onUp = () => {
    const s = st.current
    st.current = null
    if (!s) return
    if (!s.moved) { push('place', place.id); return }
    if (dx > THRESHOLD) fly(1)
    else if (dx < -THRESHOLD) fly(-1)
    else { setAnim(true); setDx(0); setTimeout(() => setAnim(false), 260) }
  }

  const rot = dx / 400
  return (
    <div className={`wtgr ${shown ? 'is-shown' : ''}`}>
      <div className="wtgr__panel wtgr__panel--l" style={{ opacity: dx > 0 ? 1 : 0 }}>
        <div className="wtgr__panel-in">
          <Icon name="favorite" size={42} color="#677EEA" />
          <span>В "Хочу пойти"</span>
        </div>
      </div>
      <div className="wtgr__panel wtgr__panel--r" style={{ opacity: dx < 0 ? 1 : 0 }}>
        <div className="wtgr__panel-in">
          <Icon name="close" size={42} color="#8E8E93" />
          <span>Пропустить</span>
        </div>
      </div>

      <div
        key={i} className="wtgr__card"
        style={{ transform: `translateX(${dx}px) rotate(${rot}deg)`, transition: anim ? 'transform 260ms var(--ease-sheet)' : 'none' }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      >
        {idx === 0 && <img className="wtgr__bg" src={photoOf(place, idx)} alt="" draggable={false} />}
        <img className={`wtgr__photo ${idx === 0 ? 'wtgr__photo--fit' : ''}`} src={photoOf(place, idx)} alt="" draggable={false} />
        <div className="wtgr__shade" />
        <div className="wtgr__info">
          <div className="wtgr__badges">
            <span className="wtgr__badge" style={{ background: '#667EEA' }}>МЕСТО</span>
            <span className="wtgr__badge" style={{ background: '#10B981' }}>{matchOf(idx)}% MATCH</span>
          </div>
          <h2 className="wtgr__name">{place.name}</h2>
          <p className="wtgr__desc">{place.description}</p>
          <div className="wtgr__row wtgr__row--cat"><Icon name="category" variant="outlined" size={16} color="#8FA4F0" /><span>{place.category}</span></div>
          <div className="wtgr__row wtgr__row--loc"><Icon name="location_on" variant="outlined" size={16} color="rgba(255,255,255,.75)" /><span>{place.address}</span></div>
          <div className="wtgr__hint">Нажми для деталей 👆</div>
        </div>
      </div>

      <div className="wtgr__top" />
      <div className="wtgr__bar">
        <button className="wtgr__btn" onClick={onClose} aria-label="Назад"><Icon name="arrow_back" size={22} color="#fff" /></button>
        <h1 className="wtgr__title">Найдено 30 мест</h1>
        <button className="wtgr__btn" onClick={closeAll} aria-label="Закрыть"><Icon name="close" size={22} color="#fff" /></button>
      </div>
    </div>
  )
}
