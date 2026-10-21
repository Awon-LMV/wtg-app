import Icon from './Icon.jsx'
import { useApp } from '../app/AppContext.jsx'
import './TabBar.css'

const ITEMS = [
  { id: 'map', label: 'Карта', icon: 'location_on' },
  { id: 'collections', label: 'Коллекции', icon: 'favorite' },
  { id: 'afisha', label: 'Афиша', icon: 'calendar_today' },
]

// variant: 'map' — серое «стекло» с белыми иконками (как на карте);
//          'plain' — прозрачный блюр с серыми иконками (Коллекции, Афиша).
// Активная вкладка отличается ТОЛЬКО точкой под подписью — как в оригинале.
export default function TabBar({ variant = 'plain' }) {
  const { tab, setTab } = useApp()
  return (
    <nav className={`tabbar tabbar--${variant}`}>
      {ITEMS.map((it) => (
        <button key={it.id} className="tabbar__item" onClick={() => setTab(it.id)} aria-current={tab === it.id ? 'page' : undefined}>
          <Icon name={it.icon} size={it.id === 'afisha' ? 28 : 31} />
          <span className="tabbar__label">{it.label}</span>
          <span className="tabbar__dot" />
        </button>
      ))}
    </nav>
  )
}
