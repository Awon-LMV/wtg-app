import BottomSheet from '../../components/BottomSheet.jsx'
import Icon from '../../components/Icon.jsx'
import { useApp } from '../../app/AppContext.jsx'
import { placeById, CATEGORY_COLORS } from '../../data/places.js'
import { eventById } from '../../data/events.js'
import './PlaceSheet.css'

// Цвета, снятые пипеткой с reference/08 (кнопка у бара темнее токена); фото карточки события без значка времени
const CAT_OVERRIDE = { 'Бары': '#75147C' }
const EVENT_CARD = { standup: '/img/ev-standup-card.jpg' }

function Stars({ value, size, color, fillColor, onPick, outlined }) {
  return [1, 2, 3, 4, 5].map((n) => {
    const filled = n <= value
    return (
      <button key={n} className="place-star" type="button" disabled={!onPick} onClick={() => onPick && onPick(n)} aria-label={`Оценка ${n}`}>
        <Icon name={filled || !outlined ? 'star' : 'star_border'} variant="round" size={size} color={filled ? fillColor : color} />
      </button>
    )
  })
}

function Body({ place }) {
  const { favorites, toggleFavorite, ratings, ratePlace, push } = useApp()
  const rated = ratings[place.id] || 0
  const isFav = favorites.includes(place.id)
  const catColor = CAT_OVERRIDE[place.category] || CATEGORY_COLORS[place.category] || 'var(--cat-default)'
  const events = (place.events || []).map(eventById).filter(Boolean)
  const sched = place.schedule
  const route = () => window.open(`https://yandex.ru/maps/?text=${encodeURIComponent(`${place.address}, Ростов-на-Дону`)}`, '_blank', 'noopener')

  return (
    <>
      <div className="place-scroll no-scrollbar">
        <div className="place-photo"><img src={place.photo} alt="" /></div>

        <div className="place-pad">
          <h1 className="place-title">{place.name}</h1>

          <div className="place-meta">
            <span className="place-rating">
              <Icon name="star" variant="round" size={16} color="#8E8E93" />
              <b>{rated ? rated.toFixed(1) : '-'}</b>
            </span>
            <span className="place-dot">•</span>
            <span className="place-cat">{place.category}</span>
            <span className="place-dot">•</span>
            <span className="place-dist">{place.distance}</span>
          </div>

          {place.tags.length > 0 && (
            <div className="place-tags">
              {place.tags.map((t) => <span key={t} className="place-tag">{t}</span>)}
            </div>
          )}

          <div className={`place-divider ${place.tags.length ? '' : 'is-notags'}`} />

          <div className="place-rows">
            <div className="place-row">
              <Icon name="location_on" variant="outlined" size={20} color="#8E8E93" />
              <span>{place.address}</span>
            </div>
            <div className="place-row">
              <Icon name="schedule" variant="outlined" size={20} color="#8E8E93" />
              {sched
                ? <span style={sched.open === false ? { color: 'var(--closed-red)' } : undefined}>{sched.text}</span>
                : <span style={{ color: '#8E8E93' }}>График не указан</span>}
            </div>
            {place.phone && (
              <a className="place-row place-link" href={`tel:${place.phone.replace(/[^+\d]/g, '')}`}>
                <Icon name="phone" variant="outlined" size={20} color="#007AFF" />
                <span>{place.phone}</span>
              </a>
            )}
            {place.site && (
              <a className="place-row place-link" href={`https://${place.site}`} target="_blank" rel="noopener noreferrer">
                <Icon name="language" variant="outlined" size={20} color="#007AFF" />
                <span>{place.site}</span>
              </a>
            )}
          </div>

          {place.description && <p className="place-desc">{place.description}</p>}

          {events.length > 0 && (
            <>
              <h2 className="place-h2 place-h2--events">Мероприятия</h2>
              <div className="place-events no-scrollbar">
                {events.map((ev) => (
                  <div key={ev.id} className="place-event" style={{ backgroundImage: `url(${EVENT_CARD[ev.id] || ev.image})` }}>
                    <div className="place-event__shade" />
                    <div className="place-event__title">{ev.title}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          <h2 className="place-h2">Рейтинг и отзывы</h2>
          <div className="place-rcard">
            <div className="place-rcard__top">
              <div className="place-rcard__num">{rated ? rated.toFixed(1) : '0.0'}</div>
              <div className="place-rcard__side">
                <div className="place-rcard__stars"><Stars value={rated} size={22} color="#D9D9DC" fillColor="#FFC107" /></div>
                <div className="place-rcard__cnt">{rated ? 1 : 0} оценок</div>
              </div>
            </div>
            <div className="place-rcard__sep" />
            <div className="place-rcard__ask">Оцените место</div>
            <div className="place-rcard__pick">
              <Stars value={rated} size={35} color="#8E8E93" fillColor="#FFC107" outlined onPick={(n) => ratePlace(place.id, n)} />
            </div>
          </div>

          <div className="place-empty">
            <div className="place-empty__circle"><Icon name="chat_bubble_outline" variant="filled" size={34} color="#8E8E93" /></div>
            <div className="place-empty__t">Нет отзывов</div>
            <div className="place-empty__s">Станьте первым!</div>
          </div>
        </div>
      </div>

      <div className="place-bar">
        <button className="place-bar__route" style={{ background: catColor }} onClick={route}>
          <Icon name="directions" variant="filled" size={24} color="#fff" />
          <span>Маршрут</span>
        </button>
        <button className="place-bar__sq" onClick={() => toggleFavorite(place.id)} aria-label="В избранное">
          <Icon name={isFav ? 'favorite' : 'favorite_border'} variant="filled" size={24} color={isFav ? '#E5605C' : '#8E8E93'} />
        </button>
        <button className="place-bar__sq" onClick={() => push('addToCollection', place.id)} aria-label="Добавить в подборку">
          <Icon name="bookmark_add" variant="outlined" size={24} color="#8E8E93" />
        </button>
      </div>
    </>
  )
}

export default function PlaceSheet({ param, onClose }) {
  const place = placeById(param)
  if (!place) return null
  return (
    <BottomSheet onClose={onClose} top={68} radius={28} handle className="place-sheet">
      <Body place={place} />
    </BottomSheet>
  )
}
