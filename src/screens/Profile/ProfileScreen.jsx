import { useEffect, useRef, useState } from 'react'
import Icon from '../../components/Icon'
import './Profile.css'

const ROWS = [
  { key: 'map', emoji: '🗺️', label: 'Карта', size: '6.6 MB', pct: 7, bg: '#E0E7FF', fill: '#6366F1' },
  { key: 'places', emoji: '📍', label: 'Места', size: '0.8 MB', pct: 1, bg: '#FEF3C7', fill: '#F59E0B' },
  { key: 'events', emoji: '🎉', label: 'События', size: '0.1 MB', pct: 0, bg: '#EDE9FE', fill: '#8B5CF6' },
  { key: 'wifi', emoji: '📶', label: 'Wi-Fi', size: '0.0 MB', pct: 0, bg: '#CFFAFE', fill: '#06B6D4' },
]
const INITIAL = { map: 7, places: 1, events: 0, wifi: 0 }

export default function ProfileScreen({ onClose, push }) {
  const [phase, setPhase] = useState('enter')
  const [progress, setProgress] = useState(INITIAL)
  const timer = useRef(null)

  useEffect(() => {
    const id = requestAnimationFrame(() => setPhase('open'))
    return () => { cancelAnimationFrame(id); clearInterval(timer.current) }
  }, [])

  const close = () => {
    setPhase('exit')
    setTimeout(() => onClose && onClose(), 300)
  }

  const download = () => {
    clearInterval(timer.current)
    timer.current = setInterval(() => {
      setProgress((p) => {
        const next = {}
        let done = true
        for (const k of Object.keys(p)) { next[k] = Math.min(100, p[k] + 4); if (next[k] < 100) done = false }
        if (done) clearInterval(timer.current)
        return next
      })
    }, 40)
  }

  return (
    <div className={`prof-root ${phase === 'open' ? 'is-open' : ''}`}>
      <div className="prof-scroll no-scrollbar">
        <div className="prof-head">
          <button className="prof-back" onClick={close} aria-label="Назад">
            <Icon name="arrow_back_ios_new" size={20} color="#475569" />
          </button>
          <div className="prof-title">
            <Icon name="person" size={18} color="#6366F1" />
            <span>ПРОФИЛЬ</span>
          </div>
          <button className="prof-gear" onClick={() => push('settings')} aria-label="Настройки">
            <Icon name="settings" size={22} color="#fff" />
          </button>
        </div>

        <div className="prof-card">
          <div className="prof-avatar">И</div>
          <div className="prof-name">Иван</div>
          <div className="prof-email">
            <Icon name="mail" variant="outlined" size={18} color="#94A3B8" />
            <span>dsjnjsdnsd@gmail.com</span>
          </div>
          <button className="prof-edit">
            <Icon name="edit" size={19} color="#fff" />
            <span>Редактировать профиль</span>
          </button>
        </div>

        <div className="prof-offline">
          <div className="prof-offline__head">
            <div className="prof-offline__icon"><Icon name="cloud_download" size={24} color="#fff" /></div>
            <div className="prof-offline__title">Офлайн данные</div>
            <div className="prof-badge">7.5 MB</div>
          </div>
          <button className="prof-dl" onClick={download}>
            <span className="prof-dl__circle"><Icon name="download" size={14} color="#6366F1" /></span>
            <span>Скачать всё для офлайна</span>
          </button>
          <div className="prof-rows">
            {ROWS.map((r) => (
              <div className="prof-row" key={r.key}>
                <span className="prof-row__emoji">{r.emoji}</span>
                <div className="prof-row__main">
                  <div className="prof-row__label">{r.label}</div>
                  <div className="prof-bar" style={{ background: r.bg }}>
                    <div className="prof-bar__fill" style={{ width: `${progress[r.key]}%`, background: r.fill }} />
                  </div>
                </div>
                <span className="prof-row__size">{r.size}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
