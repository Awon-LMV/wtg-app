import { useState } from 'react'
import { useApp } from '../app/AppContext.jsx'
import { placeById } from './catalog.js'
import { eventsForPlace, wifiForPlace } from './mapData.js'
import { Empty, IconButton, Page, Symbol, useDistance, hasLargePhoto } from './ui.jsx'

export default function PlacePage({ id, onClose }) {
  const { push, favorites, toggleFavorite, ratings, ratePlace } = useApp()
  const place = placeById(id)
  const distance = useDistance(place)
  const [showRating, setShowRating] = useState(false)
  if (!place) return <Page title="Место" onClose={onClose}><Empty title="Место не найдено" text="Вернитесь к карте и выберите другое место." /></Page>
  const saved = favorites.includes(id)
  const rating = ratings[id]
  const events = eventsForPlace(id)
  const wifi = wifiForPlace(place)
  const route = () => window.open(`https://yandex.ru/maps/?text=${encodeURIComponent(`${place.name}, ${place.address}, Ростов-на-Дону`)}`, '_blank', 'noopener,noreferrer')
  return <Page title="Место на карте" onClose={onClose} action={<IconButton label="Добавить в подборку" icon="playlist_add" onClick={() => push('addToCollection', id)} />} className="near-place" footer={<><button className="near-button" onClick={route}><Symbol name="navigation" size={20} />Маршрут</button><button className={`near-button near-button--secondary ${saved ? 'is-saved' : ''}`} aria-pressed={saved} onClick={() => toggleFavorite(id)}><Symbol name={saved ? 'bookmark' : 'bookmark_border'} size={20} />{saved ? 'Сохранено' : 'Сохранить'}</button></>}>
    {hasLargePhoto(place) && <img className="near-place-photo" src={place.photo} alt={place.name} />}
    <div className="near-place-content">
      {!hasLargePhoto(place) && <img className="near-place-thumb" src={place.pin} alt="" />}
      <p className="near-meta">{place.kind || place.category}{distance && ` · ${distance}`}</p>
      <h2 className="near-place-title">{id === 'amarcord' ? 'Амаркорд' : place.name}</h2>
      <div className="near-info">
        <div><Symbol name="location_on" size={20} /><span>{place.address}{distance && <small>По прямой от выбранной точки</small>}</span></div>
        <div><Symbol name="schedule" size={20} /><span>{place.schedule?.text || 'Часы работы не указаны'}</span></div>
        <button type="button" onClick={() => { setShowRating(!showRating) }} aria-expanded={showRating}><Symbol name={rating ? 'star' : 'chat_bubble_outline'} size={20} /><span>{rating ? `Ваша оценка: ${rating} из 5` : 'Пока нет отзывов'}</span><Symbol name="chevron_right" size={20} /></button>
      </div>
      {showRating && <div className="near-rating"><span>Ваша оценка</span><div>{[1, 2, 3, 4, 5].map(value => <button key={value} onClick={() => ratePlace(id, value)} aria-label={`Оценить на ${value}`} aria-pressed={rating === value}><Symbol name={rating >= value ? 'star' : 'star_border'} size={30} /></button>)}</div></div>}
      {place.description && <p className="near-place-description">{place.description}</p>}
      {place.tags?.length > 0 && <div className="near-place-tags">{place.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}
      {(place.phone || place.site) && <section className="near-section"><h3>Контакты</h3><div className="near-info">{place.phone && <a href={`tel:${place.phone.replace(/[^+\d]/g, '')}`}><Symbol name="phone" size={20} /><span>{place.phone}</span></a>}{place.site && <a href={`https://${place.site}`} target="_blank" rel="noreferrer"><Symbol name="language" size={20} /><span>{place.site}</span></a>}</div></section>}
      {wifi && <section className="near-section"><h3>Wi-Fi</h3><div className="near-info"><div><Symbol name="wifi" /><span>{wifi.networkName || 'Данные соединения'}{Number.isFinite(wifi.downloadMbps) && <small>Загрузка: {wifi.downloadMbps} Мбит/с</small>}{Number.isFinite(wifi.uploadMbps) && <small>Отдача: {wifi.uploadMbps} Мбит/с</small>}{Number.isFinite(wifi.pingMs) && <small>Пинг: {wifi.pingMs} мс</small>}{wifi.measuredAt && <small>Измерено: {wifi.measuredAt}</small>}</span></div></div></section>}
      {events.length > 0 && <section className="near-section"><h3>События в этом месте</h3>{events.map(event => <button key={event.id} className="near-mini-place" onClick={() => push('event', event.id)}><img src={event.image} alt="" /><span><b>{event.title}</b><small>{event.date} · {event.time}</small></span><Symbol name="chevron_right" /></button>)}</section>}
      {place.sourceUrl && <p className="near-source-note">Данные проверены 21 октября 2026.<br /><a href={place.sourceUrl} target="_blank" rel="noreferrer">Источник и сведения о месте</a><br />Фото: {place.photoCredit}</p>}
    </div>
  </Page>
}
