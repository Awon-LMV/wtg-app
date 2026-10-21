import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from '../../components/Icon.jsx'
import './WtgSearch.css'

const MOODS = [
  ['🎉', 'Потусить'], ['😌', 'Отдохнуть'], ['🧘', 'Расслабиться'], ['💼', 'Поработать'], ['😢', 'Погрустить'],
]
const COMPANY = [
  ['person', 'Один'], ['favorite', 'Вдвоём'], ['family_restroom', 'С семьёй'], ['group', 'До 5'], ['groups', '5+'],
]
const WANTS = [
  ['☕', 'Кофейня'], ['🍔', 'Фастфуд'], ['🎵', 'Музыка'], ['📶', 'Wi-Fi'], ['🚗', 'Парковка'], ['🌿', 'Терраса'],
  ['🏠', 'Уютно'], ['🍳', 'Завтраки'], ['📦', 'Доставка'], ['🎉', 'Тусовка'], ['💻', 'Коворкинг'], ['🍕', 'Итальянская'],
]
const MAX = 5000
const STEP = 100

export default function WtgSearch({ onClose, push }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [mood, setMood] = useState(null)
  const [company, setCompany] = useState(null)
  const [wants, setWants] = useState([])
  const [range, setRange] = useState([0, MAX])
  const trackRef = useRef(null)
  const drag = useRef(null)

  useEffect(() => { const id = requestAnimationFrame(() => setOpen(true)); return () => cancelAnimationFrame(id) }, [])
  const close = useCallback(() => { setOpen(false); setTimeout(() => onClose && onClose(), 300) }, [onClose])

  const toggleWant = (w) => setWants((s) => (s.includes(w) ? s.filter((x) => x !== w) : [...s, w]))

  const valueAt = (clientX) => {
    const r = trackRef.current.getBoundingClientRect()
    const v = ((clientX - r.left) / (r.width || 1)) * MAX
    return Math.min(MAX, Math.max(0, Math.round(v / STEP) * STEP))
  }
  const onThumbDown = (i) => (e) => {
    drag.current = i
    e.currentTarget.setPointerCapture?.(e.pointerId)
    e.preventDefault()
  }
  const onThumbMove = (e) => {
    const i = drag.current
    if (i == null) return
    const v = valueAt(e.clientX)
    setRange(([a, b]) => (i === 0 ? [Math.min(v, b - STEP), b] : [a, Math.max(v, a + STEP)]))
  }
  const onThumbUp = () => { drag.current = null }
  const onTrackDown = (e) => {
    if (e.target !== e.currentTarget) return
    const v = valueAt(e.clientX)
    const i = Math.abs(v - range[0]) <= Math.abs(v - range[1]) ? 0 : 1
    setRange(([a, b]) => (i === 0 ? [Math.min(v, b - STEP), b] : [a, Math.max(v, a + STEP)]))
  }

  const budgetChanged = range[0] > 0 || range[1] < MAX
  const budgetLabel = !budgetChanged ? 'Любой'
    : range[0] === 0 ? `до ${range[1]}₽`
      : range[1] === MAX ? `от ${range[0]}₽` : `${range[0]}–${range[1]}₽`
  const ready = text.trim() !== '' || mood != null || company != null || wants.length > 0 || budgetChanged

  const pct = (v) => `${(v / MAX) * 100}%`

  return (
    <div className={`wtgs ${open ? 'is-open' : ''}`}>
      <div className="wtgs__scroll no-scrollbar">
        <div className="wtgs__head">
          <div className="wtgs__logo"><Icon name="auto_awesome" size={26} color="#fff" /></div>
          <h1 className="wtgs__title">Найдите ваше<br />идеальное<br />место</h1>
          <button className="wtgs__close" onClick={close} aria-label="Закрыть"><Icon name="close" size={22} color="#8E8E93" /></button>
        </div>

        <label className="wtgs__field">
          <Icon name="search" size={22} color="#6366F1" />
          <div className="wtgs__fwrap">
            <textarea className="wtgs__input" rows={2} value={text} onChange={(e) => setText(e.target.value)} aria-label="Опишите, куда хотите пойти" />
            {text === '' && (
              <div className="wtgs__hint"><div>Опишите, куда хотите пойти...</div><div>Например: уютное кафе для работы</div></div>
            )}
          </div>
        </label>

        <h2 className="wtgs__h">Как вы себя чувствуете?</h2>
        <div className="wtgs__chips wtgs__chips--mood">
          {MOODS.map(([e, t]) => (
            <button key={t} className={`wtgs__chip ${mood === t ? 'is-on' : ''}`} onClick={() => setMood(mood === t ? null : t)}>
              <span className="wtgs__emoji">{e}</span>{t}
            </button>
          ))}
        </div>

        <h2 className="wtgs__h">В какой компании</h2>
        <div className="wtgs__tiles">
          {COMPANY.map(([ic, t]) => (
            <button key={t} className={`wtgs__tile ${company === t ? 'is-on' : ''}`} onClick={() => setCompany(company === t ? null : t)}>
              <Icon name={ic} size={26} color={company === t ? '#5B6BD6' : '#3C3C43'} />
              <span>{t}</span>
            </button>
          ))}
        </div>

        <h2 className="wtgs__h">Чего вы хотите?</h2>
        <div className="wtgs__chips wtgs__chips--want">
          {WANTS.map(([e, t]) => (
            <button key={t} className={`wtgs__chip wtgs__chip--sm ${wants.includes(t) ? 'is-on' : ''}`} onClick={() => toggleWant(t)}>
              <span className="wtgs__emoji wtgs__emoji--sm">{e}</span>{t}
            </button>
          ))}
        </div>

        <div className="wtgs__budget-row">
          <h2 className="wtgs__h wtgs__h--b">Бюджет</h2>
          <span className="wtgs__budget-val">{budgetLabel}</span>
        </div>
        <div className="wtgs__slider" onPointerDown={onTrackDown}>
          <div className="wtgs__track" ref={trackRef}>
            <div className="wtgs__fill" style={{ left: pct(range[0]), right: `calc(100% - ${pct(range[1])})` }} />
            {[0, 1].map((i) => (
              <div
                key={i} className="wtgs__thumb" style={{ left: pct(range[i]) }}
                onPointerDown={onThumbDown(i)} onPointerMove={onThumbMove} onPointerUp={onThumbUp} onPointerCancel={onThumbUp}
              />
            ))}
          </div>
        </div>
        <div className="wtgs__scale"><span>0₽</span><span>5000₽+</span></div>

        <button className={`wtgs__go ${ready ? 'is-ready' : ''}`} disabled={!ready} onClick={() => push('wtgResults')}>
          <Icon name="search" size={22} />Найти
        </button>
      </div>
    </div>
  )
}
