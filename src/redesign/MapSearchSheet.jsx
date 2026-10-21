import { useContext, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../app/AppContext.jsx'
import { MAP_CATEGORIES } from './catalog.js'
import { Chips, Empty, IconButton, LocationContext, SearchField, hasLargePhoto, useDistance } from './ui.jsx'
import { CITY_CENTER } from './location.js'

function SearchResult({ place, selected, onPlace }) {
  const { favorites, toggleFavorite } = useApp()
  const location = useContext(LocationContext)
  const distance = useDistance(place, CITY_CENTER)
  const saved = favorites.includes(place.id)
  const largePhoto = hasLargePhoto(place)
  return <article className={`near-search-card ${selected ? 'is-selected' : ''}`}>
    <button className="near-search-card__main" onClick={() => onPlace(place)}>
      <span className={`near-search-card__media ${largePhoto ? '' : 'near-search-card__media--thumb'}`}><img src={largePhoto ? place.photo : place.pin} alt="" draggable={false} /></span>
      <span className="near-search-card__category">{place.kind || place.category}</span>
      <span className="near-search-card__name">{place.id === 'amarcord' ? 'Амаркорд' : place.name}</span>
      <span className="near-search-card__distance">{distance} {location ? 'от вас' : 'от центра'}</span>
    </button>
    <div className="near-search-card__save"><IconButton label={saved ? `Убрать ${place.name} из сохранённых` : `Сохранить ${place.name}`} icon={saved ? 'bookmark' : 'bookmark_border'} aria-pressed={saved} onClick={() => toggleFavorite(place.id)} /></div>
  </article>
}

const STATES = ['compact', 'expanded', 'full']

export default function MapSearchSheet({ places, query, onQuery, category, onCategory, state, onState, selectedId, onPlace, active, blocked }) {
  const { push } = useApp()
  const anchorRef = useRef(null)
  const panelRef = useRef(null)
  const inputRef = useRef(null)
  const resultsRef = useRef(null)
  const dragRef = useRef(null)
  const ignoreClick = useRef(false)
  const touchY = useRef(null)
  const [host, setHost] = useState(null)
  const [sizes, setSizes] = useState({ compact: 146, expanded: 560, full: 844 })
  const [dragHeight, setDragHeight] = useState(null)

  useLayoutEffect(() => {
    const screen = anchorRef.current.closest('.device__screen')
    setHost(anchorRef.current.closest('.near-app'))
    const measure = () => {
      const full = screen.clientHeight
      setSizes({ compact: Math.min(146, full - 110), expanded: Math.min(full - 96, Math.round(full * .67)), full })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(screen)
    return () => observer.disconnect()
  }, [])

  const close = () => { inputRef.current?.blur(); setDragHeight(null); onState('compact') }
  const open = () => { setDragHeight(null); if (state === 'compact') { if (resultsRef.current) resultsRef.current.scrollTop = 0; onState('expanded') } }
  const fullScreen = () => { inputRef.current?.blur(); onState('full') }
  const toggle = () => { if (state === 'full') onState('expanded'); else if (state === 'expanded') close(); else open() }

  const onDown = event => {
    if (event.button !== 0) return
    const panel = panelRef.current
    ignoreClick.current = false
    dragRef.current = { y: event.clientY, height: panel.offsetHeight, state, scale: panel.getBoundingClientRect().width / panel.offsetWidth }
    event.currentTarget.setPointerCapture(event.pointerId)
    inputRef.current?.blur()
  }
  const onMove = event => {
    const drag = dragRef.current
    if (!drag) return
    const delta = (drag.y - event.clientY) / drag.scale
    if (Math.abs(delta) > 5) ignoreClick.current = true
    setDragHeight(Math.max(sizes.compact, Math.min(sizes.full, drag.height + delta)))
  }
  const onUp = event => {
    const drag = dragRef.current
    if (!drag) return
    const delta = (drag.y - event.clientY) / drag.scale
    if (Math.abs(delta) > 5) {
      ignoreClick.current = true
      // Короткого уверенного жеста достаточно, не надо тащить панель через весь экран.
      const index = STATES.indexOf(drag.state)
      const next = Math.abs(delta) > 45 ? STATES[Math.max(0, Math.min(2, index + (delta > 0 ? 1 : -1)))] : STATES.reduce((nearest, item) => Math.abs(sizes[item] - drag.height - delta) < Math.abs(sizes[nearest] - drag.height - delta) ? item : nearest, drag.state)
      if (drag.state === 'compact' && next === 'expanded' && resultsRef.current) resultsRef.current.scrollTop = 0
      onState(next)
    }
    dragRef.current = null
    setDragHeight(null)
  }
  const height = dragHeight ?? sizes[state]
  const fullProgress = Math.max(0, Math.min(1, (height - sizes.expanded) / (sizes.full - sizes.expanded)))
  const expanded = state !== 'compact'

  const panel = <section ref={panelRef} hidden={!active} inert={blocked} data-state={state} className={`near-map-panel ${expanded ? 'is-expanded' : ''} ${state === 'full' ? 'is-full' : ''} ${dragHeight !== null ? 'is-dragging' : ''}`} style={{ height, bottom: 84 * (1 - fullProgress), paddingTop: 47 * fullProgress, borderRadius: `${24 * (1 - fullProgress)}px ${24 * (1 - fullProgress)}px 0 0` }} aria-label="Поиск и места">
    <button type="button" className="near-sheet-handle" aria-label={state === 'full' ? 'Уменьшить панель мест' : expanded ? 'Свернуть список мест' : 'Развернуть список мест'} aria-expanded={expanded} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => { dragRef.current = null; setDragHeight(null) }} onClick={() => { if (ignoreClick.current) { ignoreClick.current = false; return } toggle() }}><span /></button>
    <div className="near-map-search-row"><SearchField inputRef={inputRef} value={query} onChange={onQuery} onFocus={open} onKeyDown={event => { if (event.key === 'Escape') close(); if (event.key === 'Enter') event.currentTarget.blur() }} placeholder="Поиск мест" /><button type="button" className="near-discover-button" onClick={() => push('wtg')}>Куда пойти?</button></div>
    <Chips values={MAP_CATEGORIES} selected={category} onChange={value => { onCategory(value); open() }} label="Категории мест" />
    <div ref={resultsRef} className="near-map-results no-scrollbar" hidden={!expanded} onWheel={event => { if (state === 'expanded' && event.deltaY > 3) fullScreen() }} onScroll={event => { if (state === 'expanded' && event.currentTarget.scrollTop > 0) fullScreen() }} onTouchStart={event => { touchY.current = event.touches[0]?.clientY ?? null }} onTouchMove={event => { if (state === 'expanded' && touchY.current != null && touchY.current - event.touches[0].clientY > 10) fullScreen() }}>
      {places.length ? <div className="near-search-grid">{places.map(place => <SearchResult key={place.id} place={place} selected={place.id === selectedId} onPlace={onPlace} />)}</div> : <Empty title="Таких мест нет" text="Попробуйте другое название или сбросьте категорию." />}
    </div>
  </section>

  return <><span ref={anchorRef} hidden />{host && createPortal(panel, host)}</>
}
