import { useState } from 'react'
import PhoneFrame from '../components/PhoneFrame.jsx'
import StatusBar from '../components/StatusBar.jsx'
import { useApp } from '../app/AppContext.jsx'
import NearMap, { LocationPicker } from './NearMap.jsx'
import { MapCredits } from './BasemapLayer.jsx'
import PlacePage from './PlacePage.jsx'
import { AddToCollectionPage, AfishaPage, CollectionPage, CollectionsPage, EventPage, ResultsPage, SearchPage } from './CatalogPages.jsx'
import { IconButton, LocationContext, NameDialog, Page, Symbol, countLabel } from './ui.jsx'
import './redesign.css'

const TABS = [{ id: 'map', label: 'Карта', icon: 'map' }, { id: 'afisha', label: 'Афиша', icon: 'calendar_today' }, { id: 'collections', label: 'Коллекции', icon: 'bookmark_border' }]
// Временная раскладка по просьбе пользователя; false возвращает видимую атрибуцию.
const TEMP_NAV_OVERLAY = true

function ProfilePage({ name, onName, onClose }) {
  const { push, favorites, collections } = useApp()
  const [editing, setEditing] = useState(false)
  return <><Page title="Профиль" onClose={onClose} action={<IconButton label="Настройки" icon="settings" onClick={() => push('settings')} />}><div className="near-profile"><img src="/img/avatar.jpg" alt="" /><h2>{name}</h2><button className="near-link" onClick={() => setEditing(true)}>Изменить имя</button><div className="near-profile-menu"><button onClick={() => push('collection', 'favorites')}><Symbol name="bookmark_border" /><span>Сохранённые места<small>{countLabel(favorites.length)}</small></span><Symbol name="chevron_right" /></button><button onClick={() => { onClose(); }}><Symbol name="map" /><span>Вернуться к карте</span><Symbol name="chevron_right" /></button></div><p className="near-meta">{countLabel(collections.length, ['подборка', 'подборки', 'подборок'])}</p></div></Page>{editing && <NameDialog title="Ваше имя" initialValue={name} onCancel={() => setEditing(false)} onCreate={value => { onName(value); setEditing(false) }} />}</>
}

function SettingsPage({ onClose, compact, onCompact }) {
  return <Page title="Настройки" onClose={onClose}><div className="near-list-content"><h2 className="near-setting-title">Карта</h2><label className="near-setting"><span><b>Компактные метки</b><small>Уменьшить фото мест на карте</small></span><input type="checkbox" checked={compact} onChange={event => onCompact(event.target.checked)} /></label><h2 className="near-setting-title">О приложении</h2><p className="near-setting-note">WTG — места и события Ростова-на-Дону.</p></div></Page>
}

export default function RedesignApp() {
  const { tab, setTab, stack, pop } = useApp()
  const [location, setLocation] = useState(null)
  const [name, setName] = useState('Иван')
  const [compact, setCompact] = useState(false)
  const [mapSheetState, setMapSheetState] = useState('compact')
  const renderOverlay = overlay => {
    const props = { onClose: pop }
    switch (overlay.type) {
      case 'place': return <PlacePage id={overlay.param} {...props} />
      case 'event': return <EventPage id={overlay.param} {...props} />
      case 'addToCollection': return <AddToCollectionPage id={overlay.param} {...props} />
      case 'collection': return <CollectionPage id={overlay.param} {...props} />
      case 'wtg': return <SearchPage {...props} />
      case 'wtgResults': return <ResultsPage param={overlay.param} {...props} />
      case 'profile': return <ProfilePage name={name} onName={setName} {...props} />
      case 'settings': return <SettingsPage compact={compact} onCompact={setCompact} {...props} />
      case 'locationModal':
      case 'locationPicker': return <LocationPicker onSelect={setLocation} {...props} />
      default: return <Page title="Страница не найдена" {...props}><div className="near-empty"><p>Вернитесь к карте.</p><button className="near-button" onClick={() => setTab('map')}>На карту</button></div></Page>
    }
  }
  return <PhoneFrame notch={false} className="near-stage"><LocationContext.Provider value={location}><div className={`near-app ${TEMP_NAV_OVERLAY ? 'near-app--nav-overlay' : ''} ${compact ? 'near-app--compact' : ''} ${tab === 'map' ? 'near-app--map' : ''} ${tab === 'map' && mapSheetState === 'full' ? 'near-app--map-full' : ''}`}>
    <div className="near-status-surface" />
    <div className="near-tab near-tab--map" style={{ visibility: tab === 'map' ? 'visible' : 'hidden' }} inert={tab !== 'map' || stack.length > 0 || mapSheetState === 'full'}><NearMap location={location} sheetState={mapSheetState} onSheetState={setMapSheetState} active={tab === 'map'} blocked={stack.length > 0} /></div>
    <div className="near-tab" style={{ visibility: tab === 'afisha' ? 'visible' : 'hidden' }} inert={tab !== 'afisha' || stack.length > 0}><AfishaPage /></div>
    <div className="near-tab" style={{ visibility: tab === 'collections' ? 'visible' : 'hidden' }} inert={tab !== 'collections' || stack.length > 0}><CollectionsPage /></div>
    <nav className="near-tabbar" aria-label="Основные разделы" inert={stack.length > 0 || (tab === 'map' && mapSheetState === 'full')}>{TABS.map(item => <button key={item.id} aria-current={tab === item.id ? 'page' : undefined} onClick={() => setTab(item.id)}><Symbol name={tab === item.id && item.id === 'collections' ? 'bookmark' : item.icon} size={23} /><span>{item.label}</span></button>)}</nav>
    <MapCredits visible={tab === 'map' && stack.length === 0 && mapSheetState !== 'full'} covered={TEMP_NAV_OVERLAY} />
    {stack.map((overlay, index) => <div key={overlay.key} className="near-overlay" style={{ zIndex: 100 + index * 10 }} inert={index < stack.length - 1} aria-hidden={index < stack.length - 1 || undefined}>{renderOverlay(overlay)}</div>)}
    <StatusBar tone="dark" />
  </div></LocationContext.Provider></PhoneFrame>
}
