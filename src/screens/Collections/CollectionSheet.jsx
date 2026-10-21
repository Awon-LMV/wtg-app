import BottomSheet, { useSheetClose } from '../../components/BottomSheet.jsx'
import Icon from '../../components/Icon.jsx'
import { useApp } from '../../app/AppContext.jsx'
import { EVENTS, eventById } from '../../data/events.js'
import { placeById } from '../../data/places.js'
import EventCard, { PlaceCard } from '../Afisha/EventCard.jsx'
import './CollectionSheet.css'

function CloseButton() {
  const close = useSheetClose()
  return (
    <button type="button" className="csheet__close" onClick={close} aria-label="Закрыть">
      <Icon name="close" size={24} color="#8E8E93" />
    </button>
  )
}

function Content({ param, push }) {
  const { favorites, wantToGo, collections } = useApp()
  let title = ''
  let cards = null
  if (param === 'wantToGo') {
    title = 'Хочу пойти'
    const events = wantToGo.map((id) => eventById(id) || EVENTS.find((e) => e.id === id)).filter(Boolean)
    cards = events.map((e) => <EventCard key={e.id} event={e} variant="collection" onClick={() => push('place', e.placeId)} />)
  } else {
    let ids
    if (param === 'favorites') { title = 'Избранное'; ids = favorites } else {
      const c = collections.find((x) => x.id === param)
      title = c ? c.name : ''
      ids = c ? c.placeIds : []
    }
    cards = ids.map(placeById).filter(Boolean).map((p) => <PlaceCard key={p.id} place={p} onClick={() => push('place', p.id)} />)
  }
  return (
    <>
      <div className="csheet__header">
        <div className="csheet__title ellipsis">{title}</div>
        <CloseButton />
      </div>
      <div className="csheet__scroll no-scrollbar">
        {cards.length ? <div className="csheet__grid">{cards}</div> : <div className="csheet__empty">Здесь пока пусто</div>}
      </div>
    </>
  )
}

export default function CollectionSheet({ param, onClose, push }) {
  return (
    <BottomSheet onClose={onClose} top={85} radius={28} style={{ background: '#F8F9FA' }}>
      <Content param={param} push={push} />
    </BottomSheet>
  )
}
