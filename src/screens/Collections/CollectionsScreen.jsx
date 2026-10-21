import { useState } from 'react'
import Icon from '../../components/Icon.jsx'
import { useApp } from '../../app/AppContext.jsx'
import { placeById } from '../../data/places.js'
import NewCollectionDialog from '../Place/NewCollectionDialog.jsx'
import './CollectionsScreen.css'

export default function CollectionsScreen() {
  const { push, favorites, wantToGo, collections, createCollection } = useApp()
  const [creating, setCreating] = useState(false)

  return (
    <div className="coll">
      <div className="coll__scroll no-scrollbar">
        <h1 className="coll__title">Коллекции</h1>
        <div className="coll__grid">
          <button type="button" className="coll-card" onClick={() => push('collection', 'favorites')}>
            <div className="coll-card__top coll-card__top--fav">
              <div className="coll-card__circle" style={{ background: 'var(--collections-red)', boxShadow: '0 4px 14px rgba(229,96,92,.4)' }}>
                <Icon name="favorite" size={30} color="#fff" />
              </div>
            </div>
            <div className="coll-card__bottom">
              <div className="coll-card__name ellipsis">Избранное</div>
              <div className="coll-card__sub">{favorites.length} мест</div>
            </div>
          </button>

          <button type="button" className="coll-card" onClick={() => push('collection', 'wantToGo')}>
            <div className="coll-card__top coll-card__top--want">
              <div className="coll-card__circle" style={{ background: 'var(--collections-purple)', boxShadow: '0 4px 14px rgba(163,77,187,.4)' }}>
                <Icon name="calendar_today" size={29} color="#fff" />
              </div>
            </div>
            <div className="coll-card__bottom">
              <div className="coll-card__name ellipsis">Хочу пойти</div>
              <div className="coll-card__sub">{wantToGo.length} событий</div>
            </div>
          </button>

          {collections.map((c) => {
            const first = c.placeIds[0] && placeById(c.placeIds[0])
            return (
              <button key={c.id} type="button" className="coll-card" onClick={() => push('collection', c.id)}>
                <div className="coll-card__top coll-card__top--photo">
                  {first && <img src={first.photo} alt="" draggable={false} />}
                </div>
                <div className="coll-card__bottom">
                  <div className="coll-card__name ellipsis">{c.name}</div>
                  <div className="coll-card__sub">{c.placeIds.length} мест</div>
                </div>
              </button>
            )
          })}

          <button type="button" className="coll-card coll-card--new" onClick={() => setCreating(true)}>
            <div className="coll-new__circle"><Icon name="add" size={30} color="#4286DE" /></div>
            <div className="coll-new__text">Создать<br />подборку</div>
          </button>
        </div>
      </div>
      {creating && (
        <NewCollectionDialog
          onCancel={() => setCreating(false)}
          onCreate={(name) => { createCollection(name); setCreating(false) }}
        />
      )}
    </div>
  )
}
