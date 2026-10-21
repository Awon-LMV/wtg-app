import { useState } from 'react'
import { useApp } from '../app/AppContext.jsx'
import { PLACES, placeById, MAP_CATEGORIES, EVENTS, eventById, AFISHA_CATEGORIES, eventPrice } from './catalog.js'
import { Chips, Empty, IconButton, NameDialog, Page, SearchField, Symbol, countLabel, useDistance } from './ui.jsx'

function PlaceRow({ place }) {
  const { push, favorites, toggleFavorite } = useApp()
  const distance = useDistance(place)
  return <article className="near-place-row"><button className="near-place-row__main" onClick={() => push('place', place.id)}><img src={place.pin} alt="" /><span><b>{place.name}</b><small>{place.category}{distance && ` · ${distance}`}</small><small>{place.address}</small></span></button><IconButton label={favorites.includes(place.id) ? `Убрать ${place.name} из сохранённых` : `Сохранить ${place.name}`} icon={favorites.includes(place.id) ? 'bookmark' : 'bookmark_border'} aria-pressed={favorites.includes(place.id)} onClick={() => toggleFavorite(place.id)} /></article>
}

function EventTile({ event }) {
  const { push, wantToGo, toggleWantToGo } = useApp()
  const saved = wantToGo.includes(event.id)
  return <article className="near-event-tile">
    <button className="near-event-tile__main" onClick={() => push('event', event.id)}><span className="near-event-media"><img src={event.image} alt="" loading="lazy" /><span className="near-event-age">{event.age}</span></span><span className="near-event-date">{event.date} · {event.time}</span><h2>{event.title}</h2><span className="near-event-place">{placeById(event.placeId)?.name || event.venueName}</span><span className="near-event-price">{eventPrice(event)}</span>{event.priceNote && <span className="near-event-price-note">{event.priceNote}</span>}</button>
    <button className="near-event-save" aria-label={saved ? `Убрать ${event.title} из планов` : `Добавить ${event.title} в планы`} aria-pressed={saved} onClick={() => toggleWantToGo(event.id)}><Symbol name={saved ? 'bookmark' : 'bookmark_border'} size={20} />{saved && <span>В планах</span>}</button>
  </article>
}

export function AfishaPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Все')
  const [date, setDate] = useState('Все даты')
  const events = EVENTS.filter(event => (category === 'Все' || category === event.category) && (date === 'Все даты' || date === event.date) && `${event.title} ${placeById(event.placeId)?.name || ''}`.toLowerCase().includes(query.trim().toLowerCase()))
  return <div className="near-tab-page near-afisha"><div className="near-tab-scroll no-scrollbar"><header className="near-tab-heading"><h1>Афиша</h1><span>Ростов-на-Дону</span></header><SearchField value={query} onChange={setQuery} placeholder="Событие или площадка" label="Поиск событий" /><Chips values={AFISHA_CATEGORIES} selected={category} onChange={setCategory} label="Категории событий" /><div className="near-catalog-summary"><span>{countLabel(events.length, ['событие', 'события', 'событий'])}</span><label>Дата<select aria-label="Дата события" value={date} onChange={event => setDate(event.target.value)}>{['Все даты', ...new Set(EVENTS.map(event => event.date))].map(value => <option key={value}>{value}</option>)}</select></label></div>{events.length ? <div className="near-event-grid">{events.map(event => <EventTile key={event.id} event={event} />)}</div> : <Empty title="Таких событий пока нет" text="Измените дату, категорию или поисковый запрос." />}<p className="near-catalog-note">Проверено 21 октября 2026. Расписание и цены могут меняться — уточняйте у организатора.</p></div></div>
}

export function EventPage({ id, onClose }) {
  const { push, wantToGo, toggleWantToGo } = useApp()
  const event = eventById(id)
  if (!event) return <Page title="Событие" onClose={onClose}><Empty title="Событие не найдено" /></Page>
  const saved = wantToGo.includes(id)
  const place = placeById(event.placeId)
  return <Page title="Событие" onClose={onClose} footer={<div className="near-ticket-footer"><span><b>{eventPrice(event)}</b><small>{event.priceNote || 'Билеты у организатора'}</small></span><a className="near-button" href={event.sourceUrl} target="_blank" rel="noreferrer">Билеты<Symbol name="open_in_new" size={18} /></a><IconButton label={saved ? 'Убрать из планов' : 'Добавить в планы'} icon={saved ? 'bookmark' : 'bookmark_border'} aria-pressed={saved} onClick={() => toggleWantToGo(id)} /></div>}><img className="near-event-hero" src={event.image} alt="" /><div className="near-place-content"><p className="near-meta">{event.category} · {event.age}</p><h2 className="near-place-title">{event.title}</h2><div className="near-info"><div><Symbol name="calendar_today" /><span>{event.date} 2026 · {event.time}</span></div>{place ? <button onClick={() => push('place', place.id)}><Symbol name="location_on" /><span>{place.name}<small>{place.address}</small></span><Symbol name="chevron_right" /></button> : <div><Symbol name="location_on" /><span>{event.venueName || 'Место проведения'}<small>{event.address || (Number.isFinite(event.lat) && Number.isFinite(event.lng) ? `${event.lat}, ${event.lng}` : 'Адрес пока не указан')}</small></span></div>}</div><p className="near-place-description">{event.description}</p><p className="near-source-note">Расписание и цена проверены 21 октября 2026. Перед покупкой уточните доступность билетов.<br /><a href={event.sourceUrl} target="_blank" rel="noreferrer">Источник и афиша: {event.sourceName}</a></p></div></Page>
}

export function CollectionsPage() {
  const { push, favorites, wantToGo, collections, createCollection } = useApp()
  const [creating, setCreating] = useState(false)
  return <div className="near-tab-page"><div className="near-tab-scroll no-scrollbar"><header className="near-tab-heading"><h1>Коллекции</h1><IconButton label="Создать подборку" icon="add" onClick={() => setCreating(true)} /></header><p className="near-intro">Сохранённые места и планы на потом.</p><div className="near-saved-shortcuts"><button onClick={() => push('collection', 'favorites')}><Symbol name="bookmark_border" size={27} /><b>Избранное</b><span>{countLabel(favorites.length)}</span></button><button onClick={() => push('collection', 'wantToGo')}><Symbol name="calendar_today" size={27} /><b>Хочу пойти</b><span>{countLabel(wantToGo.filter(eventById).length, ['событие', 'события', 'событий'])}</span></button></div><div className="near-section-heading"><h2>Мои подборки</h2><button onClick={() => setCreating(true)}>Создать</button></div>{collections.length ? <div className="near-collection-list">{collections.map(collection => {
    const first = placeById(collection.placeIds[0])
    return <button key={collection.id} className="near-collection" onClick={() => push('collection', collection.id)}>{first ? <img src={first.photo} alt="" /> : <span className="near-collection-placeholder"><Symbol name="folder_open" /></span>}<span><b>{collection.name}</b><small>{countLabel(collection.placeIds.length)}</small></span><Symbol name="chevron_right" /></button>
  })}</div> : <Empty title="Подборок пока нет" text="Соберите места для прогулки, встречи или выходных." />}</div>{creating && <NameDialog title="Новая подборка" onCancel={() => setCreating(false)} onCreate={name => { createCollection(name); setCreating(false) }} />}</div>
}

export function CollectionPage({ id, onClose }) {
  const { favorites, wantToGo, collections } = useApp()
  const collection = collections.find(item => item.id === id)
  const title = id === 'favorites' ? 'Избранное' : id === 'wantToGo' ? 'Хочу пойти' : collection?.name || 'Подборка'
  const events = id === 'wantToGo' ? wantToGo.map(eventById).filter(Boolean) : []
  const places = (id === 'favorites' ? favorites : collection?.placeIds || []).map(placeById).filter(Boolean)
  return <Page title={title} onClose={onClose}><div className="near-list-content">{id === 'wantToGo' ? events.length ? <div className="near-event-grid">{events.map(event => <EventTile key={event.id} event={event} />)}</div> : <Empty title="Планов пока нет" text="Сохраняйте понравившиеся события из афиши." /> : places.length ? <div>{places.map(place => <PlaceRow key={place.id} place={place} />)}</div> : <Empty title="Здесь пока пусто" text="Откройте место на карте, чтобы добавить его в подборку." />}</div></Page>
}

export function AddToCollectionPage({ id, onClose }) {
  const { collections, addToCollection, createCollection } = useApp()
  const [creating, setCreating] = useState(false)
  return <><Page title="Добавить в подборку" onClose={onClose}><div className="near-list-content"><button className="near-create-row" onClick={() => setCreating(true)}><Symbol name="add" />Создать новую подборку</button>{collections.map(collection => <button key={collection.id} className="near-collection" onClick={() => { addToCollection(collection.id, id); onClose() }}><span className="near-collection-placeholder"><Symbol name="folder_open" /></span><span><b>{collection.name}</b><small>{countLabel(collection.placeIds.length)}</small></span><Symbol name={collection.placeIds.includes(id) ? 'check' : 'chevron_right'} /></button>)}</div></Page>{creating && <NameDialog title="Новая подборка" onCancel={() => setCreating(false)} onCreate={name => { createCollection(name, id); setCreating(false); onClose() }} />}</>
}

export function SearchPage({ onClose }) {
  const { push } = useApp()
  const [text, setText] = useState('')
  const [category, setCategory] = useState('Все')
  const matches = filterPlaces(text, category)
  return <Page title="Подобрать место" onClose={onClose} footer={<button className="near-button" onClick={() => push('wtgResults', JSON.stringify({ text, category }))}>Показать {countLabel(matches.length)}<Symbol name="arrow_forward" size={19} /></button>}><form className="near-search-form" onSubmit={event => { event.preventDefault(); push('wtgResults', JSON.stringify({ text, category })) }}><h2>Куда хочется пойти?</h2><p>Найдите место по названию, категории или описанию.</p><label className="near-field">Что ищем?<input value={text} onChange={event => setText(event.target.value)} placeholder="Например, кофе или мороженое" /></label><h3>Категория</h3><div className="near-category-options">{MAP_CATEGORIES.map(value => <button type="button" key={value} aria-pressed={category === value} onClick={() => setCategory(value)}>{value}</button>)}</div></form></Page>
}

function filterPlaces(text, category) {
  const query = text.trim().toLowerCase().replaceAll('ё', 'е')
  return PLACES.filter(place => (category === 'Все' || place.category === category) && (!query || `${place.name} ${place.category} ${place.description} ${place.tags.join(' ')}`.toLowerCase().replaceAll('ё', 'е').includes(query)))
}

export function ResultsPage({ param, onClose }) {
  let filters = { text: '', category: 'Все' }
  try { if (param) filters = { ...filters, ...JSON.parse(param) } } catch { /* Старый URL результатов остаётся доступен. */ }
  const places = filterPlaces(filters.text, filters.category)
  return <Page title="Подходящие места" onClose={onClose}><div className="near-list-content"><div className="near-results-heading"><p>{countLabel(places.length)}</p><span>{[filters.text, filters.category !== 'Все' ? filters.category : ''].filter(Boolean).join(' · ') || 'Все места в каталоге'}</span></div>{places.length ? places.map(place => <PlaceRow key={place.id} place={place} />) : <Empty title="Ничего не найдено" text="Попробуйте более короткий запрос или другую категорию."><button className="near-button near-button--secondary" onClick={onClose}>Изменить поиск</button></Empty>}</div></Page>
}
